import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { CategoryValidator } from "../Validators";
import Category from "../Models/Category";
import { CategoryService } from "../Services/CategoryService";
import Service from "../Models/Service";

export default class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  public async all({ auth }: HttpContextContract) {
    return Category.query()
      .select("id", "name")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async index({ auth }: HttpContextContract) {
    return Category.query()
      .select("id", "name", "description")
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { ...data } = await request.validate(CategoryValidator);

    const isExiteNameCategory = await this.service.isExiteNameCategory({ auth, request });
    if (isExiteNameCategory instanceof Error) {
      return response.status(422).send({ message: isExiteNameCategory.message });
    }

    const category = await Category.create({
      ...data,
      description: data.description || "",
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return category.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Category.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, response, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(CategoryValidator);

    const isExiteNameCategory = await this.service.isExiteNameCategory({ auth, request, id });
    if (isExiteNameCategory instanceof Error) {
      return response.status(422).send({ message: isExiteNameCategory.message });
    }

    const category = await Category.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await category
      .merge({ ...data, description: data.description || "", user_id: auth.user?.id })
      .save();
    return category;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const hasServices = await Service.query().where("category_id", id).first();
    if (hasServices) {
      return response
        .status(400)
        .send({ message: "A categoria não pode ser removida porque pertence a um serviço" });
    }

    const address = await Category.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
