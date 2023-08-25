import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";
import Role from "App/Modules/Auth/Models/Role";

const roles = [
  { name: "Super Administrador", slug: "sup_admin", visible: false },
  { name: "Administrador", slug: "admin" },
  { name: "Assistente", slug: "supp" },
];

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    await Role.fetchOrCreateMany("slug", roles);

    const role = await Role.query().where("slug", "supp").firstOrFail();
    const permissions = await Permission.query().select("id").pojo();
    const ids = permissions.map((permission: Permission) => permission.id);
    await role.related("permissions").sync(ids);
  }
}
