import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ItemValidator } from "../Validators";
import { ItemService } from "../Services/ItemService";
import Item from "../Models/Item";

export default class ItemsController {
  private service: ItemService;

  constructor() {
    this.service = new ItemService();
  }

  public async list({ params: { filter } }: HttpContextContract) {
    return Item.query()
      .select("id", "document", "name")
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("document", "iLike", `%${filter.replace(/[.|-]/g, "")}%`)
      .orderBy("name", "asc")
      .limit(50);
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Item.query().preload("product").where("id", id).firstOrFail();
  }

  public async store({ auth, request }: HttpContextContract) {
    const data = await request.validate(ItemValidator);

    const item = await Item.create({
      ...data,
      customer_id: auth.user?.id!,
    });

    return item;
  }

  public async update({ request, params: { id } }: HttpContextContract) {
    const item = await Item.findOrFail(id);
    const data = await request.validate(ItemValidator);

    const _item = await item.merge({ ...data }).save();
    return _item;
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const item = await Item.findOrFail(id);
    await item.delete();

    return response.status(204);
  }
}
