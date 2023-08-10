import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { makeAuth } from "Tests/utils";
import { PortionValidator } from "../Validators";
import Product from "App/Modules/Products/Models/Product";
import Portion from "App/Modules/Portions/Models/Portion";

const portionSchema = new PortionValidator();
type PortionAttributes = typeof portionSchema.schema.props;

const portion: PortionAttributes = {
  product_id: "",
  order: 1,
  name: "Bandeja",
  price_cents: 100,
  default: false,
  status: true,
};

test.group("portions", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list portions", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("portions").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create portion", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    const response = await client
      .post("portions")
      .json({ ...portion, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(200);
    response.assertBodyContains({ ...portion, product_id: product?.id });
  });

  test("should be able to not create portion with the same name", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    await Portion.create({ ...portion, product_id: product?.id });

    const response = await client
      .post("portions")
      .json({ ...portion, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(422);
    response.assertBodyContains({
      errors: [{ field: "name", rule: "unique" }],
    });
  });

  test("should be able to update portion", async ({ client }) => {
    const auth = await makeAuth();

    const product = await Product.first();

    const portionUpdated: PortionAttributes = {
      product_id: product?.id!,
      order: 1,
      name: "Bandeja2",
      price_cents: 4999,
      default: true,
      status: true,
    };

    const _product = await Portion.create({ ...portion, product_id: product?.id });

    const response = await client
      .put(`portions/${_product.id}`)
      .json(portionUpdated)
      .bearerToken(auth.token);
    response.assertStatus(200);
    response.assertBodyContains(portionUpdated);
  });
});
