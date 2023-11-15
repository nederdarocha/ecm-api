import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { OrderServiceValidator, MetaDataValidator } from "../Validators";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import OrderService from "../Models/OrderService";
import ExtraData from "App/Modules/Services/Models/ExtraData";
import MetaData from "App/Modules/Services/Models/MetaData";
import Database from "@ioc:Adonis/Lucid/Database";
import { OrderServiceService } from "../Services/OrderServiceService";

type GetServiceExtraData = {
  label: string;
  name: string;
  options: string | null;
  style: string;
  type: string;
  value: string | null;
  meta_data_id: string | null;
};

// SERVICES
export default class OrderServiceController {
  private service: OrderServiceService;
  constructor() {
    this.service = new OrderServiceService();
  }

  public async getServices({ auth, params: { order_id } }: HttpContextContract) {
    const orderServices = await OrderService.query()
      .preload("court", (sq) => sq.select(["id", "initials", "name"]))
      .preload("service", (sq) => sq.select("*").preload("category"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id);

    return orderServices.map((orderService) => {
      return orderService.serialize({
        fields: {
          omit: ["tenant_id", "user_id"],
        },
        relations: {
          court: {
            fields: {
              pick: ["id", "initials", "name"],
            },
          },
          service: {
            fields: {
              pick: ["id", "name"],
            },
          },
          category: {
            fields: {
              pick: ["id", "name"],
            },
          },
        },
      });
    });
  }

  public async updateOrderService({
    auth,
    request,
    params: { order_service_id },
  }: HttpContextContract) {
    const orderService = await OrderService.findOrFail(order_service_id);

    const { honorary_cents_value, honorary_type, service_cents_amount, court_id, court_number } =
      await request.validate(OrderServiceValidator);

    await orderService
      .merge({
        honorary_type,
        honorary_cents_value: honorary_cents_value || null,
        service_cents_amount: service_cents_amount || null,
        court_id: court_id || null,
        court_number: court_number || null,
        user_id: auth.user!.id,
      })
      .save();

    return orderService;
  }

  public async updateMetaData({ auth, request, response }: HttpContextContract) {
    const { data } = await request.validate(MetaDataValidator);
    let query = "";
    for (const item of data) {
      const value = item.value ? `'${item.value}'` : null;
      query += `UPDATE meta_data SET value=${value}, updated_at=now(), user_id='${auth.user?.id}' WHERE id='${item.meta_data_id}';`;
    }
    await Database.rawQuery(query);
    return response.status(200);
  }

  public async getServiceExtraData({ auth, params: { order_service_id } }: HttpContextContract) {
    const orderService = await OrderService.query().where("id", order_service_id).first();
    if (!orderService) {
      return [];
    }

    const extraData = await ExtraData.query().where("service_id", orderService.service_id);

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
        .where("order_service_id", order_service_id)
        .andWhere("extra_data_id", extra.id)
        .first();

      if (!meta) {
        meta = await MetaData.create({
          order_service_id,
          extra_data_id: extra.id,
          user_id: auth.user!.id,
        });
      }

      data[extraData.indexOf(extra)].meta_data_id = meta.id;
      data[extraData.indexOf(extra)].value = meta.value;
    }

    return data;
  }

  public async addService({ auth, request, params: { order_id } }: HttpContextContract) {
    const { service_id } = await request.validate({
      schema: schema.create({ service_id: schema.string([rules.uuid()]) }),
    });

    const orderService = await OrderService.create({
      tenant_id: auth.user!.tenant_id,
      order_id: order_id,
      service_id,
      user_id: auth.user!.id,
    });

    // await orderService.load("court", (sq) => sq.select(["id", "initials", "name"]));
    await orderService.load("service", (sq) => sq.select("*").preload("category"));

    return orderService.serialize({
      fields: {
        omit: ["tenant_id", "user_id"],
      },
      relations: {
        court: {
          fields: {
            pick: ["id", "initials", "name"],
          },
        },
        service: {
          fields: {
            pick: ["id", "name"],
          },
        },
        category: {
          fields: {
            pick: ["id", "name"],
          },
        },
      },
    });
  }

  public async destroyService({
    auth,
    response,
    params: { order_service_id },
  }: HttpContextContract) {
    const customerOrderServiceModel = await OrderService.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", order_service_id)
      .firstOrFail();

    const checkServiceDelete = await this.service.checkServiceDelete(customerOrderServiceModel);
    if (checkServiceDelete instanceof Error) {
      return response.status(400).send({ message: checkServiceDelete.message });
    }

    await customerOrderServiceModel.delete();
    response.status(204);
  }
}
