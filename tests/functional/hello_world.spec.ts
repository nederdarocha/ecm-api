import { test } from "@japa/runner";

test("health check", async ({ client, assert }) => {
  const response = await client.get("/health-check");

  response.assertStatus(200);
  assert?.exists(response.body().now);
});
