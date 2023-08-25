import Env from "@ioc:Adonis/Core/Env";
import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { UserFactory } from "Database/factories";
import Role from "App/Modules/Auth/Models/Role";
import bcrypt from "bcrypt";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const [supAdmin, admin, supp] = await UserFactory.merge([
      {
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        first_name: "Super",
        last_name: "Admin",
        email: "admin@bento.dev.br",
        document: "11111111111",
        phone: "21964276349",
        password: Env.get("USER_PASSWORD", "secret"),
        salt: await bcrypt.genSalt(10),
      },
      {
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        first_name: "User",
        last_name: "Bento",
        email: "user@bento.dev.br",
        document: "22222222222",
        password: Env.get("USER_PASSWORD", "secret"),
        salt: await bcrypt.genSalt(10),
      },
      {
        id: "ee73b0f5-ffd6-40b9-9a3f-917fdd284f7a",
        tenant_id: "a2db73d8-c917-4558-8451-1a9f235b7d6b",
        first_name: "Supporter",
        last_name: "Bento",
        email: "supp@bento.dev.br",
        document: "33333333333",
        password: Env.get("USER_PASSWORD", "secret"),
        salt: await bcrypt.genSalt(10),
      },
    ]).createMany(99);

    const [roleSupAdmin, roleAdmin, roleSupp] = await Role.query()
      .whereIn("slug", ["sup_admin", "admin", "supp"])
      .orderBy("created_at", "asc");
    await supAdmin.related("roles").sync([roleSupAdmin.id, roleAdmin.id]);
    await admin.related("roles").sync([roleAdmin.id]);
    await supp.related("roles").sync([roleSupp.id]);
  }
}
