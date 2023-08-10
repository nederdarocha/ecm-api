import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { GroupValidator } from "../Validators";
import Group from "../Models/Group";

export default class GroupController {
  public async index({ paginate, request }: HttpContextContract) {
    const { page, limit } = paginate;
    const { filter } = request.qs();

    return Group.query()
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("slug", "iLike", `%${filter}%`)
      .paginate(page, limit);
  }

  public async store({ auth, request }: HttpContextContract) {
    let { ...data } = await request.validate(GroupValidator);
    return await Group.create({ ...data, user_id: auth.user?.id });
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Group.findOrFail(id);
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(GroupValidator);
    const customer = await Group.findOrFail(id);
    await customer.merge({ ...data, user_id: auth.user?.id }).save();
    return customer;
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const customer = await Group.findOrFail(id);
    await customer.delete();
    return response.status(204);
  }
}
