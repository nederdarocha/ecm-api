import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ServiceValidator } from "../Validators";
import Service from "../Models/Service";
import { ServiceService } from "../Services/ServiceService";

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

  public async index({ auth, paginate }: HttpContextContract) {
    const services = await Service.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc")
      .paginate(paginate.page, paginate.per_page);

    return services.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { ...data } = await request.validate(ServiceValidator);

    const isExiteNameCategory = await this.service.isExiteNameCategory({ auth, request });
    if (isExiteNameCategory instanceof Error) {
      return response.status(422).send({ message: isExiteNameCategory.message });
    }

    const service = await Service.create({
      ...data,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return service.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Service.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, response, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(ServiceValidator);

    const isExiteNameCategory = await this.service.isExiteNameCategory({ auth, request, id });
    if (isExiteNameCategory instanceof Error) {
      return response.status(422).send({ message: isExiteNameCategory.message });
    }

    const service = await Service.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await service.merge({ ...data, user_id: auth.user?.id }).save();
    return service;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const address = await Service.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
