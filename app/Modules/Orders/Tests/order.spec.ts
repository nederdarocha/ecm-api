import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { makeAuth } from "Tests/utils";
import { OrderValidator } from "../Validators";
import Product from "App/Modules/Products/Models/Product";
import Order from "App/Modules/Orders/Models/Order";

const OrderSchema = new OrderValidator();
type OrderAttributes = typeof OrderSchema.schema.props;

const order: OrderAttributes = {
  customer_id: "",
  description: "",
};

test.group("orders", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list orders", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("orders").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create order", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    const response = await client
      .post("orders")
      .json({ ...order, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(200);
    response.assertBodyContains({ ...order, product_id: product?.id });
  });

  test("should be able to not create order with the same name", async ({ client }) => {
    const auth = await makeAuth();
    const product = await Product.first();

    await Order.create({ ...order });

    const response = await client
      .post("orders")
      .json({ ...order, product_id: product?.id })
      .bearerToken(auth.token);

    response.assertStatus(422);
    response.assertBodyContains({
      errors: [{ field: "name", rule: "unique" }],
    });
  });

  test("should be able to update order", async ({ client }) => {
    const auth = await makeAuth();

    const product = await Product.first();

    const orderUpdated: OrderAttributes = {
      customer_id: "",
      description: "",
    };

    const _product = await Order.create({ ...order });

    const response = await client
      .put(`orders/${_product.id}`)
      .json(orderUpdated)
      .bearerToken(auth.token);
    response.assertStatus(200);
    response.assertBodyContains(orderUpdated);
  });
});
