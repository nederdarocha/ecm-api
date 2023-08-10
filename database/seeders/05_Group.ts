import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Group from "App/Modules/Groups/Models/Group";

export default class GroupSeeder extends BaseSeeder {
  public async run() {
    await Group.createMany([
      {
        name: "Bovino",
        slug: "bovino",
        order: 1,
        status: true,
      },
      {
        name: "Frango",
        slug: "frango",
        order: 2,
        status: true,
      },
      {
        name: "Suíno",
        slug: "suino",
        order: 2,
        status: true,
      },
    ]);
  }
}
