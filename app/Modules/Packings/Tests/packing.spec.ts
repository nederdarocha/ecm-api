import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { makeAuth } from "Tests/utils";
import { PackingValidator } from "../Validators";
import Product from "App/Modules/Products/Models/Product";
import Packing from "App/Modules/Packings/Models/Packing";

const packingSchema = new PackingValidator();
type PackingAttributes = typeof packingSchema.schema.props;

const packing: PackingAttributes = {
  product_id: "",
  order: 1,
  name: "Bandeja",
  price_cents: 100,
  default: false,
  status: true,
};

test.group("packings", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list packings", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("packings").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create packing", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    const response = await client
      .post("packings")
      .json({ ...packing, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(200);
    response.assertBodyContains({ ...packing, product_id: product?.id });
  });

  test("should be able to not create packing with the same name", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    await Packing.create({ ...packing, product_id: product?.id });

    const response = await client
      .post("packings")
      .json({ ...packing, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(422);
    response.assertBodyContains({
      errors: [{ field: "name", rule: "unique" }],
    });
  });

  test("should be able to update packing", async ({ client }) => {
    const auth = await makeAuth();

    const product = await Product.first();

    const packingUpdated: PackingAttributes = {
      product_id: product?.id!,
      order: 1,
      name: "Bandeja2",
      price_cents: 4999,
      default: true,
      status: true,
    };

    const _product = await Packing.create({ ...packing, product_id: product?.id });

    const response = await client
      .put(`packings/${_product.id}`)
      .json(packingUpdated)
      .bearerToken(auth.token);
    response.assertStatus(200);
    response.assertBodyContains(packingUpdated);
  });
});
