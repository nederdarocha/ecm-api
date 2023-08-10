import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Permission from "../Models/Permission";
import { PermissionStoreValidator } from "../Validators";
import PermissionUpdateValidator from "../Validators/PermissionUpdateValidator";

export default class PermissionController {
  public async all({}: HttpContextContract) {
    return Permission.query().select("id", "name").orderBy("name", "asc");
  }

  public async index({}: HttpContextContract) {
    return Permission.query().orderBy("name", "asc");
  }

  public async store({ request }: HttpContextContract) {
    const { ...data } = await request.validate(PermissionStoreValidator);
    return await Permission.create(data);
  }

  public async show({}: HttpContextContract) {}

  public async update({ request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(PermissionUpdateValidator);
    const permission = await Permission.findOrFail(id);

    return await permission.merge(data).save();
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const permission = await Permission.findOrFail(id);
    await permission.delete();

    return response.status(204);
  }
}
