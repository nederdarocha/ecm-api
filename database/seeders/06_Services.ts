import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { ServiceFactory } from "Database/factories";

export default class ServiceSeeder extends BaseSeeder {
  public async run() {
    await ServiceFactory.with("category").createMany(5);
  }
}
