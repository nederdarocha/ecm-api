import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { CustomerOrderServiceValidator } from "../Validators";
import { schema } from "@ioc:Adonis/Core/Validator";
import CustomerOrder from "../Models/CustomerOrder";
import CustomerOrderServiceModel from "../Models/CustomerOrderService";
import ExtraData from "App/Modules/Services/Models/ExtraData";
import MetaData from "App/Modules/Services/Models/MetaData";

type GetServiceExtraData = {
  label: string;
  name: string;
  options: string | null;
  style: string;
  type: string;
  value: string | null;
  meta_data_id: string | null;
};

export default class OrderServiceController {
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
        customer_id: data.customer_id,
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

    const data: GetServiceExtraData[] = extraData?.map((extra_data) => ({
      label: extra_data.label,
      name: extra_data.name,
      options: extra_data.options,
      placeholder: extra_data.placeholder,
      style: extra_data.style,
      type: extra_data.type,
      value: null,
      meta_data_id: null,
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
      customer_id: customerOrderServiceModel.customer_id,
      order_id: customerOrderServiceModel.order_id,
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
}
