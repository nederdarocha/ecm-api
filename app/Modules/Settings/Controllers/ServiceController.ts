import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { SettingValidator } from "../Validators";
import Setting from "../Models/Setting";

export default class SettingController {
  public async index({ auth }: HttpContextContract) {
    return Setting.query().where("tenant_id", auth.user!.tenant_id).orderBy("name", "asc");
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(SettingValidator);

    const setting = await Setting.create({
      tenant_id: auth.user!.tenant_id,
      ...data,
    });

    return setting;
  }

  public async show({ auth }: HttpContextContract) {
    return await Setting.query().where("tenant_id", auth.user!.tenant_id).firstOrFail();
  }

  public async update({ auth, request }: HttpContextContract) {
    let { ...data } = await request.validate(SettingValidator);

    const setting = await Setting.query().where("tenant_id", auth.user!.tenant_id).firstOrFail();

    await setting.merge({ ...data }).save();
    return setting;
  }
}
