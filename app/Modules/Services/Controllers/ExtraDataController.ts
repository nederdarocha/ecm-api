import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ExtraDataValidator } from "../Validators";
import ExtraData from "../Models/ExtraData";

export default class ExtraDataController {
  public async all({ auth }: HttpContextContract) {
    return ExtraData.query()
      .select("id", "name")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async index({ auth }: HttpContextContract) {
    return ExtraData.query()
      .select("*")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }
  public async getByService({ auth, params: { service_id } }: HttpContextContract) {
    return ExtraData.query()
      .select("*")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("service_id", service_id)
      .orderBy("name", "asc");
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(ExtraDataValidator);

    const service = await ExtraData.create({
      ...data,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return service.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await ExtraData.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { placeholder, options, ...data } = await request.validate(ExtraDataValidator);

    const service = await ExtraData.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await service
      .merge({
        ...data,
        placeholder: placeholder || null,
        options: options || null,
        user_id: auth.user?.id,
      })
      .save();
    return service;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const address = await ExtraData.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
