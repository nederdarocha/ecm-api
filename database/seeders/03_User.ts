import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { UserFactory } from "Database/factories";
import Role from "App/Modules/Auth/Models/Role";
import { USERS } from "../constants";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const [sup_admin, admin, supp] = await UserFactory.merge([
      {
        ...USERS.sup_admin,
      },
      { ...USERS.admin },
      { ...USERS.supp },
    ]).createMany(4);

    const [roleSupAdmin, roleAdmin, roleSupp] = await Role.query()
      .whereIn("slug", ["sup_admin", "admin", "supp"])
      .orderBy("created_at", "asc");

    await sup_admin.related("roles").sync([roleSupAdmin.id, roleAdmin.id]);
    await admin.related("roles").sync([roleAdmin.id]);
    await supp.related("roles").sync([roleSupp.id]);
  }
}
