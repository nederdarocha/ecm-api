import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ServiceValidator } from "../Validators";
import Service from "../Models/Service";
import { ServiceService } from "../Services/ServiceService";
import ExtraData from "../Models/ExtraData";
import File from "App/Modules/Files/Models/File";
import CustomerOrderService from "App/Modules/Orders/Models/CustomerOrderService";

export default class ServiceController {
  private service: ServiceService;

  constructor() {
    this.service = new ServiceService();
  }

  public async all({ auth }: HttpContextContract) {
    return Service.query()
      .select("id", "name")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async index({ auth }: HttpContextContract) {
    return Service.query()
      .select("id", "name", "description", "out_court", "category_id")
      .preload("category", (sq) => sq.select("id", "name"))
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { description, ...data } = await request.validate(ServiceValidator);

    const isExiteNameCategory = await this.service.isExiteNameCategory({ auth, request });
    if (isExiteNameCategory instanceof Error) {
      return response.status(422).send({ message: isExiteNameCategory.message });
    }

    const service = await Service.create({
      ...data,
      description: description || null,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return service.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Service.query()
      .preload("category", (sq) => sq.select("id", "name"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, response, params: { id } }: HttpContextContract) {
    let { description, ...data } = await request.validate(ServiceValidator);

    const isExiteNameCategory = await this.service.isExiteNameCategory({ auth, request, id });
    if (isExiteNameCategory instanceof Error) {
      return response.status(422).send({ message: isExiteNameCategory.message });
    }

    const service = await Service.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await service
      .merge({ ...data, description: description || null, user_id: auth.user?.id })
      .save();
    return service;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    // check if service has extra data
    const hasServices = await CustomerOrderService.query().where("service_id", id).first();
    if (hasServices) {
      return response.status(400).send({
        message: "Este serviço não pode ser excluído, pois está sendo utilizado em um contrato.",
      });
    }

    const address = await Service.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }

  public async getExtraData({ auth, params: { id } }: HttpContextContract) {
    const extraData = await ExtraData.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("service_id", id)
      .orderBy("order", "asc");

    //verifica se existe os meta dados e cria se não houver
    // for (const item of extraData) {
    // }

    return extraData.map((item) => item.serialize({ fields: { omit: ["tenant_id", "user_id"] } }));
  }

  public async getTemplates({ auth, params: { id } }: HttpContextContract) {
    const data = await File.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", id)
      .orderBy("name", "asc");

    return data.map((item) => item.serialize({ fields: { omit: ["tenant_id", "user_id"] } }));
  }
}
