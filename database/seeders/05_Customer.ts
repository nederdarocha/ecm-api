import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { CustomerFactory } from "Database/factories";

export default class CustomerSeeder extends BaseSeeder {
  public async run() {
    const customers = await CustomerFactory.with("addresses", 1).with("created_by").createMany(20);
    const indicated = customers.map((customer) => ({ indicated_id: customer.id }));

    await CustomerFactory.with("addresses", 1).merge(indicated).createMany(20);
  }
}
