import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TemplateMessageValidator } from "../Validators";
import TemplateMessage from "../Models/TemplateMessage";
import { TemplateMessageService } from "../Services/TemplateMessageService";
import User from "App/Modules/Users/Models/User";

export default class TemplateMessageController {
  private service: TemplateMessageService;

  constructor() {
    this.service = new TemplateMessageService();
  }

  public async all({ auth }: HttpContextContract) {
    return TemplateMessage.query()
      .select("id", "name")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async index({ auth }: HttpContextContract) {
    return TemplateMessage.query()
      .select("id", "name", "body")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async handleTemplate({ auth, params: { id, customer_id } }: HttpContextContract) {
    const templateMessage = await TemplateMessage.query()
      .select("id", "name", "body")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    const user = await User.query()
      .select("first_name", "last_name")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_id", customer_id)
      .firstOrFail();

    return {
      template: templateMessage.body
        .replace(/{usuario_nome}/g, `${user.first_name}`)
        .replace(/{usuario_nome_completo}/g, `${user.first_name} ${user.last_name}`),
    };
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { ...data } = await request.validate(TemplateMessageValidator);

    const isExiteName = await this.service.isExiteName({ auth, request });
    if (isExiteName instanceof Error) {
      return response.status(422).send({ message: isExiteName.message });
    }

    const templateMessage = await TemplateMessage.create({
      ...data,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return templateMessage.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await TemplateMessage.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, response, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(TemplateMessageValidator);

    const isExiteName = await this.service.isExiteName({ auth, request, id });
    if (isExiteName instanceof Error) {
      return response.status(422).send({ message: isExiteName.message });
    }

    const service = await TemplateMessage.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await service.merge({ ...data, user_id: auth.user?.id }).save();
    return service;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const templateMessage = await TemplateMessage.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await templateMessage.delete();

    return response.status(204);
  }
}
