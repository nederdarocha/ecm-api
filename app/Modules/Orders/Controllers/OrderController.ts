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

export default class OrderController {
  private service: OrderService;
  constructor() {
    this.service = new OrderService();
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const orders = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .paginate(paginate.page, paginate.per_page);

    return orders.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async getByCustomer({ auth, params: { customer_id } }: HttpContextContract) {
    const orders = await CustomerOrder.query()
      .preload("order", (sq) =>
        sq.select(["id", "order", "number", "started_at", "ended_at", "status"])
      )
      .preload("customerOrderServices", (sq) =>
        sq.select("*").preload("service", (sq) => sq.select(["id", "name"]))
      )
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_id", customer_id);

    return orders.map((order) => order.serialize({ fields: { omit: ["tenant_id", "user_id"] } }));
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
      status: "draft",
    });

    return order.serialize({
      fields: { omit: ["tenant_id", "user_id", "order"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(OrderValidator);

    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await order.merge({ ...data, user_id: auth.user?.id }).save();
    return order;
  }

  public async updateNotes({ auth, request, params: { id } }: HttpContextContract) {
    let { notes } = await request.validate({
      schema: schema.create({ notes: schema.string.optional({ trim: true }) }),
    });

    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await order.merge({ notes: notes || "", user_id: auth.user?.id }).save();
    return order;
  }

  // SERVICES
  public async getServices({ auth, params: { customer_order_id } }: HttpContextContract) {
    const customerOrderService = await CustomerOrderServiceModel.query()
      .preload("service", (sq) => sq.select("*").preload("category"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_order_id", customer_order_id);

    return customerOrderService.map(
      ({ id, service, honorary_type, honorary_value, service_amount }) => ({
        customer_order_service_id: id,
        id: service.id,
        name: service.name,
        honorary_type,
        honorary_value,
        service_amount,
        category: { id: service?.category?.id, name: service?.category?.name },
      })
    );
  }

  public async updateCustomerOrderService({
    auth,
    request,
    params: { customer_order_service_id },
  }: HttpContextContract) {
    const customerOrderService = await CustomerOrderServiceModel.findOrFail(
      customer_order_service_id
    );

    const { honorary_value, honorary_type, service_amount } = await request.validate(
      CustomerOrderServiceValidator
    );

    await customerOrderService
      .merge({
        honorary_type,
        honorary_value: honorary_value || null,
        service_amount: service_amount || null,
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

    const customerOrderServiceModel = await CustomerOrderServiceModel.create({
      tenant_id: auth.user!.tenant_id,
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

    // alterar o status de rascunho para aberto
    if (order.status === "draft") {
      await order.merge({ status: "opened" }).save();
    }

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