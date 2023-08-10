import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Packing from "App/Modules/Packings/Models/Packing";
import Product from "App/Modules/Products/Models/Product";

export default class PackingSeeder extends BaseSeeder {
  public async run() {
    const product = await Product.first();

    await Packing.createMany([
      {
        product_id: product?.id,
        order: 1,
        name: "Saquinho",
        price_cents: 100,
        default: true,
        status: true,
      },
    ]);
  }
}
