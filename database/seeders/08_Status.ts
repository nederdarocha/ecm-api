import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { StatusFactory } from "Database/factories";
import { STATUS } from "../constants";

export default class StatusSeeder extends BaseSeeder {
  public async run() {
    await StatusFactory.merge([
      { ...STATUS.rascunho },
      { ...STATUS.emAndamento },
      { ...STATUS.encerrado },
    ]).createMany(3);
  }
}
