import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";
import Role from "App/Modules/Auth/Models/Role";

const roles = [
  { name: "ADMINISTRADOR", slug: "admin" },
  { name: "ASSISTENTE", slug: "supp" },
];

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    await Role.fetchOrCreateMany("slug", roles);

    let role = await Role.query().where("slug", "admin").firstOrFail();
    let permissions = await Permission.query().select("id").pojo();
    let ids = permissions.map((permission: Permission) => permission.id);
    await role.related("permissions").sync(ids);

    role = await Role.query().where("slug", "supp").firstOrFail();
    permissions = await Permission.query().select("id").whereNot("slug", "iLike", "%user").pojo();
    ids = permissions.map((permission: Permission) => permission.id);

    await role.related("permissions").sync(ids);
  }
}
