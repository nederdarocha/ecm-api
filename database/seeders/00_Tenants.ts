import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Tenant from "App/Modules/Tenants/Models/Tenant";
import { TENANTS } from "../constants";

export const _tenants = [{ ...TENANTS.alfa }, { ...TENANTS.bravo }, { ...TENANTS.charlie }];

export default class TenantSeeder extends BaseSeeder {
  public async run() {
    await Tenant.fetchOrCreateMany("name", _tenants);
  }
}
