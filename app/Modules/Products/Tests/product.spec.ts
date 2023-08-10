import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { makeAuth } from "Tests/utils";
import { ProductValidator } from "../Validators";
import Product from "App/Modules/Products/Models/Product";
import Group from "App/Modules/Groups/Models/Group";

const productSchema = new ProductValidator();
type ProductAttributes = typeof productSchema.schema.props;

const product: ProductAttributes = {
  group_id: "",
  order: 1,
  name: "Filé Mignon",
  slug: "file-mignon",
  description: "Corte traseiro",
  measured: "Kg",
  price_cents: 4999,
  price_cents_discount: null,
  quantity_min: 500,
  increase: 250,
  quantity_max: 20000,
  highlight: false,
  available: true,
  status: true,
};

test.group("product", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list products", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("products").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create product", async ({ client }) => {
    const auth = await makeAuth();
    const group = await Group.first();

    const response = await client
      .post("products")
      .json({ ...product, group_id: group?.id })
      .bearerToken(auth.token);

    response.assertStatus(200);
    response.assertBodyContains({ ...product, group_id: group?.id });
  });

  test("should be able to not create product with the same name or same slug", async ({
    client,
  }) => {
    const auth = await makeAuth();
    const group = await Group.first();

    await Product.create({ ...product, group_id: group?.id });

    const response = await client
      .post("products")
      .json({ ...product, group_id: group?.id })
      .bearerToken(auth.token);

    response.assertStatus(422);
    response.assertBodyContains({
      errors: [
        { field: "name", rule: "unique" },
        { field: "slug", rule: "unique" },
      ],
    });
  });

  test("should be able to update product", async ({ client }) => {
    const auth = await makeAuth();

    const group = await Group.first();

    const productUpdated: ProductAttributes = {
      group_id: group?.id!,
      order: 1,
      name: "Filé Mignon2",
      slug: "file-mignon2",
      description: "Corte traseiro2",
      measured: "Kg",
      price_cents: 4999,
      price_cents_discount: null,
      quantity_min: 500,
      increase: 250,
      quantity_max: 20000,
      highlight: false,
      available: true,
      status: true,
    };

    const _product = await Product.create({ ...product, group_id: group?.id });

    const response = await client
      .put(`products/${_product.id}`)
      .json(productUpdated)
      .bearerToken(auth.token);
    response.assertStatus(200);
    response.assertBodyContains(productUpdated);
  });
});
