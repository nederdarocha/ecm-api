import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { CustomerFactory } from "Database/factories";

export default class CustomerSeeder extends BaseSeeder {
  public async run() {
    const customers = await CustomerFactory.with("addresses", 2).with("created_by").createMany(10);
    const indicated = customers.map((customer) => ({ indicated_id: customer.id }));

    await CustomerFactory.with("addresses", 1).merge(indicated).with("created_by").createMany(10);
  }
}
