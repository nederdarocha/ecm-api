import Env from "@ioc:Adonis/Core/Env";
import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { UserFactory } from "Database/factories";
import Role from "App/Modules/Auth/Models/Role";
import bcrypt from "bcrypt";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const [admin, supp, supp_2] = await UserFactory.merge([
      {
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        name: "Admin",
        email: "admin@admin.com",
        document: "11111111111",
        phone: "21964276349",
        password: Env.get("USER_PASSWORD", "secret"),
        salt: await bcrypt.genSalt(10),
      },
      {
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        name: "User",
        email: "user@user.com",
        document: "22222222222",
        password: Env.get("USER_PASSWORD", "secret"),
        salt: await bcrypt.genSalt(10),
      },
      {
        id: "ee73b0f5-ffd6-40b9-9a3f-917fdd284f7a",
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        name: "Supporter",
        email: "supp@supp.com",
        document: "33333333333",
        password: Env.get("USER_PASSWORD", "secret"),
        salt: await bcrypt.genSalt(10),
      },
    ]).createMany(99);

    const [roleAdmin, roleSupp] = await Role.query().whereIn("slug", ["admin", "supp"]);
    await admin.related("roles").sync([roleAdmin.id, roleSupp.id]);
    await supp.related("roles").sync([roleSupp.id]);
    await supp_2.related("roles").sync([roleSupp.id]);
  }
}
