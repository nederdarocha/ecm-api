import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { DateTime } from "luxon";
import { OrderValidator } from "../Validators";
import Order from "../Models/Order";
import { OrderService } from "../Services/OrderService";
import { schema } from "@ioc:Adonis/Core/Validator";
import OrderCustomer from "../Models/CustomerOrder";
import OrderCustomerServiceModel from "../Models/CustomerOrderService";
import ExtraData from "App/Modules/Services/Models/ExtraData";
import MetaData from "App/Modules/Services/Models/MetaData";

export default class OrderController {
  private service: OrderService;
  constructor() {
    this.service = new OrderService();
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const addresses = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .paginate(paginate.page, paginate.per_page);

    return addresses.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, response }: HttpContextContract) {
    const isOrderDraft = await this.service.getOrderDraft(auth);
    if (isOrderDraft) {
      return response.status(200).json({
        data: isOrderDraft.toJSON(),
        message: "Use este rascunho para aproveitar o número gerado.",
      });
    }

    const order = await this.service.getNextSequence(auth);
    const number = await this.service.getNextNumber(auth);

    const address = await Order.create({
      order,
      number,
      started_at: DateTime.now(),
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
      status: "draft",
    });

    return address.serialize({
      fields: { omit: ["tenant_id", "user_id", "order"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  // SERVICES
  public async getServices({ auth, params: { customer_order_id } }: HttpContextContract) {
    const caseService = await OrderCustomerServiceModel.query()
      .preload("service", (sq) => sq.select("*").preload("category"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_order_id", customer_order_id);

    return caseService.map(({ id, service }) => ({
      case_customer_service_id: id,
      id: service.id,
      name: service.name,
      category: { id: service?.category?.id, name: service?.category?.name },
    }));
  }

  public async getServiceExtraData({
    auth,
    params: { customer_order_service_id },
  }: HttpContextContract) {
    //TODO refatorar para retornar extra e meta data

    // buscar o serviço
    // buscar os extra data do serviço
    // buscar ou criar os meta data do serviço

    const caseCustomerService = await OrderCustomerServiceModel.findOrFail(
      customer_order_service_id
    );
    const extraData = await ExtraData.query().where("service_id", caseCustomerService.service_id);

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
          name: extra.name,
          customer_order_service_id,
          extra_data_id: extra.id,
          user_id: auth.user!.id,
        });
      }

      data[extraData.indexOf(extra)].meta_data_id = meta.id;
      data[extraData.indexOf(extra)].value = meta.value;
    }

    return data;

    return extraData?.map((extra_data) => ({
      label: extra_data.label,
      name: extra_data.name,
      options: extra_data.options,
      style: extra_data.style,
      type: extra_data.type,
    }));
  }

  public async destroyService({
    auth,
    response,
    params: { case_customer_service_id },
  }: HttpContextContract) {
    const caseService = await OrderCustomerServiceModel.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", case_customer_service_id)
      .firstOrFail();

    //TODO verificar se cliente possui pagamento ao serviço antes de remover

    await caseService.delete();
    response.status(204);
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

    await OrderCustomerServiceModel.create({
      tenant_id: auth.user!.tenant_id,
      service_id,
      customer_order_id,
      user_id: auth.user!.id,
    });

    response.status(200);
  }

  // CUSTOMERS

  public async getCustomers({ auth, params: { id } }: HttpContextContract) {
    const caseCustomer = await OrderCustomer.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", id);

    return caseCustomer.map(({ id, customer }) => ({
      case_customer_id: id,
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      natural: customer.natural,
    }));
  }

  public async destroyCustomer({
    auth,
    response,
    params: { id, customer_id },
  }: HttpContextContract) {
    const caseCustomer = await OrderCustomer.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", id)
      .andWhere("customer_id", customer_id)
      .firstOrFail();

    //TODO verificar se cliente possui serviços vinculados ao caso antes de remover

    await caseCustomer.delete();
    response.status(204);
  }

  public async addCustomer({ auth, request, response, params: { id } }: HttpContextContract) {
    const { customer_id } = await request.validate({
      schema: schema.create({ customer_id: schema.string() }),
    });

    const _case = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await OrderCustomer.create({
      tenant_id: auth.user!.tenant_id,
      order_id: _case.id,
      customer_id,
      user_id: auth.user!.id,
    });

    // alterar o status de rascunho para aberto
    if (_case.status === "draft") {
      await _case.merge({ status: "open" }).save();
    }

    response.status(200);
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(OrderValidator);

    const address = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.merge({ ...data, user_id: auth.user?.id }).save();
    return address;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const address = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
