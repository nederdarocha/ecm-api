import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";

test.group("auth", (group) => {
  // abre uma transação para cada teste evitando
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("login", async ({ client }) => {
    const response = await client.get("/health-check");

    response.assertStatus(200);
    response.assert?.exists(response.body().now);
  });
});
