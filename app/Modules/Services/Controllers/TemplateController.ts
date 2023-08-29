import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TemplateValidator, TemplateUpdateValidator } from "../Validators";
import Template from "../Models/Template";
import { TemplateService } from "../Services/TemplateService";

export default class TemplateController {
  private service: TemplateService;

  constructor() {
    this.service = new TemplateService();
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const templates = await Template.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc")
      .paginate(paginate.page, paginate.per_page);

    return templates.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { file, ...data } = await request.validate(TemplateValidator);

    const isExiteNameTemplate = await this.service.isExiteNameTemplate({ auth, request });
    if (isExiteNameTemplate instanceof Error) {
      return response.status(422).send({ message: isExiteNameTemplate.message });
    }

    const template = await Template.create({
      ...data,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return template.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Template.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, response, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(TemplateUpdateValidator);

    const isExiteNameTemplate = await this.service.isExiteNameTemplate({ auth, request, id });
    if (isExiteNameTemplate instanceof Error) {
      return response.status(422).send({ message: isExiteNameTemplate.message });
    }

    const category = await Template.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await category.merge({ ...data, user_id: auth.user?.id }).save();
    return category;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const address = await Template.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
