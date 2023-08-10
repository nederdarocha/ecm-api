import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { UserFactory } from "Database/factories";
import Role from "App/Modules/Auth/Models/Role";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const [admin, prod] = await UserFactory.merge([
      {
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        name: "Admin",
        email: "admin@admin.com",
        document: "11111111111",
        phone: "21964276349",
        password: "secret",
        salt: 1,
      },
      {
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        name: "User",
        email: "user@user.com",
        document: "22222222222",
        password: "secret",
        salt: 2,
      },
    ]).createMany(3);

    const [roleAdmin, roleProd] = await Role.query().whereIn("slug", ["admin", "assis"]);
    await admin.related("roles").sync([roleAdmin.id, roleProd.id]);
    await prod.related("roles").sync([roleProd.id]);
  }
}
