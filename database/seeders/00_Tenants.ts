import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Tenant from "App/Modules/Tenants/Models/Tenant";

export const tenants = [
  { id: "a2db73d8-c917-4558-8451-1a9f235b7d6b", name: "alfa", status: true, user_id: null },
  { id: "b8fd022f-9a16-4a3e-b5ad-aa3607774755", name: "bravo", status: true, user_id: null },
  { id: "c714215d-4d09-475b-830b-143898bb997e", name: "charlie", status: true, user_id: null },
];

export default class TenantSeeder extends BaseSeeder {
  public async run() {
    await Tenant.fetchOrCreateMany("name", tenants);
  }
}
