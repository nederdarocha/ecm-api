import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Permission from "../Models/Permission";
import { PermissionStoreValidator } from "../Validators";
import PermissionUpdateValidator from "../Validators/PermissionUpdateValidator";
import PermissionUpdatePartialValidator from "../Validators/PermissionUpdatePartialValidator";
import PermissionStoreRelatedRoleValidator from "../Validators/PermissionStoreRelatedRoleValidator";

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

  public async storeRelatedRole({ request }: HttpContextContract) {
    const { role_id, initials, ...data } = await request.validate(
      PermissionStoreRelatedRoleValidator
    );
    return (
      await Permission.create({
        ...data,
        slug: `${initials}-${data.slug}`,
      })
    )
      .related("roles")
      .attach([role_id]);
  }

  public async updateRelatedRole({ request, params: { id } }: HttpContextContract) {
    const permission = await Permission.findOrFail(id);
    const { role_id, initials, slug, ...data } = await request.validate(
      PermissionStoreRelatedRoleValidator
    );

    return permission
      .merge({
        ...data,
        slug: `${initials}-${slug}`,
      })
      .save();
  }

  public async show({}: HttpContextContract) {}

  public async update({ request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(PermissionUpdateValidator);
    const permission = await Permission.findOrFail(id);

    return await permission.merge(data).save();
  }

  public async updatePartial({ request, params: { id } }: HttpContextContract) {
    const { initial, checked } = await request.validate(PermissionUpdatePartialValidator);
    const permission = await Permission.findOrFail(id);

    const [_, name] = permission.slug.split("-");

    permission[initial] = checked;
    permission.slug = `${permission.c ? "c" : ""}${permission.r ? "r" : ""}${
      permission.u ? "u" : ""
    }${permission.d ? "d" : ""}-${name}`;

    return await permission.save();
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const permission = await Permission.findOrFail(id);
    await permission.delete();

    return response.status(204);
  }
}
