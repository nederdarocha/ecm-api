import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Cut from "App/Modules/Cuts/Models/Cut";
import Product from "App/Modules/Products/Models/Product";

export default class CutSeeder extends BaseSeeder {
  public async run() {
    const product = await Product.first();

    await Cut.createMany([
      {
        product_id: product?.id,
        order: 1,
        name: "Corte Inteiro",
        default: true,
        status: true,
      },
    ]);
  }
}
