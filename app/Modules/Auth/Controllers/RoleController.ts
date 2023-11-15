import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Role from "../Models/Role";
import { RoleStoreValidator } from "../Validators";
import RoleUpdateValidator from "../Validators/RoleUpdateValidator";

export default class RoleController {
  public async all({}: HttpContextContract) {
    return Role.query().select("id", "name").where("visible", true).orderBy("name", "asc");
  }

  public async index({}: HttpContextContract) {
    return Role.query().preload("permissions").where("visible", true).orderBy("name", "asc");
  }

  public async store({ request }: HttpContextContract) {
    const { ...data } = await request.validate(RoleStoreValidator);
    const role = await Role.create(data);
    return role.load("permissions");
  }

  public async show({ params }: HttpContextContract) {
    return Role.query()
      .where("visible", true)
      .andWhere("id", params.id)
      .preload("permissions")
      .firstOrFail();
  }

  public async update({ request, params, response }: HttpContextContract) {
    const { permission_ids, ...data } = await request.validate(RoleUpdateValidator);
    const role = await Role.findOrFail(params.id);

    await role.merge(data).save();
    await role.related("permissions").sync(permission_ids);

    return response.ok({ message: "ok" });
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const role = await Role.findOrFail(id);
    await role.delete();

    return response.status(204);
  }
}
