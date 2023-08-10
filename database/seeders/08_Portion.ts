import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Portion from "App/Modules/Portions/Models/Portion";
import Product from "App/Modules/Products/Models/Product";

export default class PortionSeeder extends BaseSeeder {
  public async run() {
    const product = await Product.first();

    await Portion.createMany([
      {
        product_id: product?.id,
        order: 1,
        name: "Individual",
        price_cents: 100,
        default: true,
        status: true,
      },
    ]);
  }
}
