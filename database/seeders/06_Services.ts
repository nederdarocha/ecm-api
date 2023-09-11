import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { CategoryFactory, ServiceFactory } from "Database/factories";

export default class ServiceSeeder extends BaseSeeder {
  public async run() {
    const categories = await CategoryFactory.merge([
      { name: "Judiciais" },
      { name: "Extrajudicial" },
      { name: "Administrativos" },
    ]).createMany(3);

    await ServiceFactory.merge([
      { name: "FUSPOM", category_id: categories[0].id },
      { name: "Revisar Contrato", category_id: categories[1].id },
      { name: "Assistir Documento de Defesa", category_id: categories[2].id },
    ]).createMany(3);
  }
}
