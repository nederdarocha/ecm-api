import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { AddressFactory } from "Database/factories";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await AddressFactory.createMany(10);
  }
}
