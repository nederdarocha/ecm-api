import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ExtraDataValidator } from "../Validators";
import ExtraData from "../Models/ExtraData";

export default class MetaDataController {
  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(ExtraDataValidator);

    const service = await ExtraData.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await service.merge({ ...data, user_id: auth.user?.id }).save();
    return service;
  }
}
