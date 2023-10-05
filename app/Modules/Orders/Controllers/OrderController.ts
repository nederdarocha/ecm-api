import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { DateTime } from "luxon";
import { OrderValidator, CustomerOrderServiceValidator } from "../Validators";
import Order from "../Models/Order";
import { OrderService } from "../Services/OrderService";
import { schema } from "@ioc:Adonis/Core/Validator";
import CustomerOrder from "../Models/CustomerOrder";
import CustomerOrderServiceModel from "../Models/CustomerOrderService";
import ExtraData from "App/Modules/Services/Models/ExtraData";
import MetaData from "App/Modules/Services/Models/MetaData";
import CustomerOrderService from "../Models/CustomerOrderService";

export default class OrderController {
  private service: OrderService;
  constructor() {
    this.service = new OrderService();
  }

  public async index({ auth, request, paginate }: HttpContextContract) {
    const { number, status_id, service_id, court_number, customer_id, indicated_id } = request.qs();

    const query = CustomerOrderService.query()
      .preload("order", (sq) => sq.select("*").preload("status", (sq) => sq.select(["id", "name"])))
      .preload("customer", (sq) => sq.select(["id", "name", "document", "natural"]))
      .preload("court", (sq) => sq.select(["id", "initials", "name"]))
      .preload("service", (sq) => sq.select(["id", "name"]))
      .where("tenant_id", auth.user!.tenant_id);

    if (number) {
      query.andWhereHas("order", (query) => query.where("number", "iLike", `%${number}%`));
    }

    if (status_id) {
      query.andWhereHas("order", (query) => query.whereIn("status_id", [status_id]));
    }

    if (service_id) {
      query.andWhere("service_id", service_id);
    }

    if (court_number) {
      query.andWhereRaw(`REGEXP_REPLACE(court_number ,'\D','','g') iLike ?`, [`%${court_number}%`]);
    }

    if (customer_id) {
      query.andWhereHas("customer", (query) => query.whereIn("customer_id", [customer_id]));
    }

    if (indicated_id) {
      query.andWhereHas("customer", (query) => query.whereIn("indicated_id", [indicated_id]));
    }

    const orders = await query.paginate(paginate.page, paginate.per_page);
    const _orders = orders.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { order: { fields: { omit: ["tenant_id", "user_id", "status_id"] } } },
    });

    const drafts = await this.service.getOrdersDrafts(auth);

    if (drafts.length > 0) {
      _orders.data = [...drafts, ..._orders.data];
    }

    return _orders;
  }

  public async getByCustomer({ auth, params: { customer_id } }: HttpContextContract) {
    const orders = await CustomerOrderService.query()
      .preload("order", (sq) =>
        sq
          .select(["id", "order", "number", "started_at", "ended_at", "status_id"])
          .preload("status", (sq) => sq.select(["id", "name"]))
      )
      .preload("service", (sq) => sq.select(["id", "name"]))
      .preload("court", (sq) => sq.select(["id", "initials", "name"]))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_id", customer_id);

    return orders.map((order) =>
      order.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
        relations: { customerOrderServices: { fields: { omit: ["tenant_id", "user_id"] } } },
      })
    );
  }

  public async store({ auth, response }: HttpContextContract) {
    const isOrderDraft = await this.service.getOrderDraft(auth);
    if (isOrderDraft) {
      return response.status(200).json({
        data: isOrderDraft.toJSON(),
        message: "Use este rascunho para aproveitar o número gerado.",
      });
    }

    const nextOrder = await this.service.getNextSequence(auth);
    const number = await this.service.getNextNumber(auth);

    const order = await Order.create({
      order: nextOrder,
      number,
      started_at: DateTime.now(),
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
      status_id: null,
    });

    return order.serialize({
      fields: { omit: ["tenant_id", "user_id", "order"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Order.query()
      .preload("status", (sq) => sq.select(["id", "name"]))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { notes, ...data } = await request.validate(OrderValidator);

    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await order.merge({ ...data, notes: notes || "", user_id: auth.user?.id }).save();
    await order.load("status", (sq) => sq.select(["id", "name"]));

    return order;
  }

  public async updateNotes({ auth, request, params: { id } }: HttpContextContract) {
    let { notes, status_id } = await request.validate({
      schema: schema.create({
        status_id: schema.string({ trim: true }),
        notes: schema.string.optional({ trim: true }),
      }),
    });

    const order = await Order.query()

      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await order.merge({ status_id, notes: notes || "", user_id: auth.user?.id }).save();
    await order.load("status", (sq) => sq.select(["id", "name"]));

    return order;
  }

  // SERVICES
  public async getServices({ auth, params: { customer_order_id } }: HttpContextContract) {
    const customerOrderService = await CustomerOrderServiceModel.query()
      .preload("court", (sq) => sq.select(["id", "initials", "name"]))
      .preload("service", (sq) => sq.select("*").preload("category"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_order_id", customer_order_id);

    const res = customerOrderService.map((item) => {
      const { id, service, court, ...data } = item.toJSON();
      return {
        customer_order_service_id: id,
        id: service.id,
        name: service.name,
        honorary_type: data.honorary_type,
        honorary_cents_value: data.honorary_cents_value,
        service_cents_amount: data.service_cents_amount,
        court_id: data.court_id,
        court_number: data.court_number,
        court: { id: court?.id, initials: court?.initials, name: court?.name },
        category: { id: service?.category?.id, name: service?.category?.name },
      };
    });

    return res;
  }

  public async updateCustomerOrderService({
    auth,
    request,
    params: { customer_order_service_id },
  }: HttpContextContract) {
    const customerOrderService = await CustomerOrderServiceModel.findOrFail(
      customer_order_service_id
    );

    const { honorary_cents_value, honorary_type, service_cents_amount, court_id, court_number } =
      await request.validate(CustomerOrderServiceValidator);

    await customerOrderService
      .merge({
        honorary_type,
        honorary_cents_value: honorary_cents_value || null,
        service_cents_amount: service_cents_amount || null,
        court_id: court_id || null,
        court_number: court_number || null,
        user_id: auth.user!.id,
      })
      .save();

    return customerOrderService;
  }

  public async getServiceExtraData({
    auth,
    params: { customer_order_service_id },
  }: HttpContextContract) {
    const customerOrderService = await CustomerOrderServiceModel.query()
      .where("id", customer_order_service_id)
      .first();
    if (!customerOrderService) {
      return [];
    }

    const extraData = await ExtraData.query().where("service_id", customerOrderService.service_id);

    if (!extraData) {
      return [];
    }

    const data = extraData?.map((extra_data) => ({
      label: extra_data.label,
      name: extra_data.name,
      options: extra_data.options,
      style: extra_data.style,
      type: extra_data.type,
      value: "",
      meta_data_id: "",
    }));

    for await (const extra of extraData) {
      let meta = await MetaData.query()
        .where("customer_order_service_id", customer_order_service_id)
        .andWhere("extra_data_id", extra.id)
        .first();

      if (!meta) {
        meta = await MetaData.create({
          customer_order_service_id,
          extra_data_id: extra.id,
          user_id: auth.user!.id,
        });
      }

      data[extraData.indexOf(extra)].meta_data_id = meta.id;
      data[extraData.indexOf(extra)].value = meta.value;
    }

    return data;
  }

  public async addService({
    auth,
    request,
    response,
    params: { customer_order_id },
  }: HttpContextContract) {
    const { service_id } = await request.validate({
      schema: schema.create({ service_id: schema.string() }),
    });

    const customerOrder = await CustomerOrder.findOrFail(customer_order_id);

    const customerOrderServiceModel = await CustomerOrderServiceModel.create({
      tenant_id: auth.user!.tenant_id,
      order_id: customerOrder.order_id,
      customer_id: customerOrder.customer_id,
      service_id,
      customer_order_id,
      user_id: auth.user!.id,
    });

    await customerOrderServiceModel.load("service", (sq) => sq.select("*").preload("category"));
    const service = customerOrderServiceModel.service;

    response.status(200).json({
      customer_order_service_id: customerOrderServiceModel.id,
      id: service.id,
      name: service.name,
      category: { id: service?.category?.id, name: service?.category?.name },
    });
  }

  public async destroyService({
    auth,
    response,
    params: { customer_order_service_id },
  }: HttpContextContract) {
    const customerOrderServiceModel = await CustomerOrderServiceModel.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", customer_order_service_id)
      .firstOrFail();

    //TODO verificar se cliente possui pagamento ao serviço antes de remover

    await customerOrderServiceModel.delete();
    response.status(204);
  }

  // CUSTOMERS
  public async getCustomers({ auth, params: { id } }: HttpContextContract) {
    const customerOrder = await CustomerOrder.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", id);

    return customerOrder.map(({ id, customer }) => ({
      customer_order_id: id,
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      natural: customer.natural,
    }));
  }

  public async addCustomer({ auth, request, response, params: { id } }: HttpContextContract) {
    const { customer_id } = await request.validate({
      schema: schema.create({ customer_id: schema.string() }),
    });

    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    const orderCustomer = await CustomerOrder.create({
      tenant_id: auth.user!.tenant_id,
      order_id: order.id,
      customer_id,
      user_id: auth.user!.id,
    });

    await orderCustomer.load("customer");
    const customer = orderCustomer.customer;

    response.status(200).json({
      customer_order_id: orderCustomer.id,
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      natural: customer.natural,
    });
  }

  public async destroyCustomer({
    auth,
    response,
    params: { id, customer_order_id },
  }: HttpContextContract) {
    const caseCustomer = await CustomerOrder.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", id)
      .andWhere("id", customer_order_id)
      .firstOrFail();

    //TODO verificar se cliente possui serviços vinculados ao caso antes de remover
    await caseCustomer.delete();
    response.status(204);
  }
}
