import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import { getToken } from "Tests/utils";
import { AddressFactory, UserFactory } from "Database/factories";
import { tenants } from "Database/seeders/00_Tenants";

test.group("addresses", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar se usuário sem privilégio tentar acessar os recursos.", async ({ client }) => {
    const user = await UserFactory.merge({ password: "password" }).create();
    const token = await getToken(user.email, "password");

    const resp_store = await client.post("/addresses").json({}).bearerToken(token);
    console.log(resp_store.body());

    resp_store.assertStatus(403);

    const resp_list = await client.get("/addresses").bearerToken(token);
    resp_list.assertStatus(403);

    const address = await AddressFactory.create();

    const resp_show = await client.get(`/addresses/${address.id}`).bearerToken(token);
    resp_show.assertStatus(403);

    const resp_update = await client
      .put(`/addresses/${address.id}`)
      .json({ name: "Novo Nome" })
      .bearerToken(token);

    resp_update.assertStatus(403);
  });

  test("conseguir criar um endereço", async ({ client }) => {
    const token = await getToken();

    const user = await UserFactory.create();
    const address = await AddressFactory.merge({
      owner_id: user.id,
      tenant_id: tenants[0].id,
    }).make();

    const response = await client.post(`/addresses`).json(address.toJSON()).bearerToken(token);

    response.assertStatus(200);
    response.assert?.assert(address.toJSON());
    response.assert?.notExists(response.body().tenant_id, "tenant_id exposto");
  });
});
