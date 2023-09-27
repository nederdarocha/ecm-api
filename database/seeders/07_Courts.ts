import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { CourtFactory } from "Database/factories";

export default class ServiceSeeder extends BaseSeeder {
  public async run() {
    await CourtFactory.merge([
      { name: "3º Juizado Especial Fazendário", initials: "3º JEFAZ" },
    ]).createMany(2);
  }
}
