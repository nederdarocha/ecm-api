import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { makeAuth } from "Tests/utils";
import { CutValidator } from "../Validators";
import Product from "App/Modules/Products/Models/Product";
import Cut from "App/Modules/Cuts/Models/Cut";

const cutSchema = new CutValidator();
type CutAttributes = typeof cutSchema.schema.props;

const cut: CutAttributes = {
  product_id: "",
  order: 1,
  name: "Bifes",
  default: false,
  status: true,
};

test.group("cuts", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list cuts", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("cuts").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create cut", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    const response = await client
      .post("cuts")
      .json({ ...cut, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(200);
    response.assertBodyContains({ ...cut, product_id: product?.id });
  });

  test("should be able to not create cut with the same name", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    await Cut.create({ ...cut, product_id: product?.id });

    const response = await client
      .post("cuts")
      .json({ ...cut, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(422);
    response.assertBodyContains({
      errors: [{ field: "name", rule: "unique" }],
    });
  });

  test("should be able to update cut", async ({ client }) => {
    const auth = await makeAuth();

    const product = await Product.first();

    const cutUpdated: CutAttributes = {
      product_id: product?.id!,
      order: 1,
      name: "Bandeja2",
      default: true,
      status: true,
    };

    const _cut = await Cut.create({ ...cut, product_id: product?.id });

    const response = await client.put(`cuts/${_cut.id}`).json(cutUpdated).bearerToken(auth.token);
    response.assertStatus(200);
    response.assertBodyContains(cutUpdated);
  });
});
