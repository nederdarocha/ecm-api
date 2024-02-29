import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { TENANTS } from "../constants";
import TypeTask from "App/Modules/Tasks/Models/TypeTask";

export default class TypeTasksSeeder extends BaseSeeder {
  public async run() {
    await TypeTask.updateOrCreateMany("name", [
      {
        name: "Audiência",
        description: "desc",
        status: true,
        tenant_id: TENANTS.alfa.id,
      },
      {
        name: "Tramitação",
        description: "desc",
        status: true,
        tenant_id: TENANTS.alfa.id,
      },
      {
        name: "Demanda",
        description: "desc",
        status: true,
        tenant_id: TENANTS.alfa.id,
      },
    ]);
  }
}
