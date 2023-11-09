import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import { TENANTS } from "Database/constants";
import { CourtFactory, UserFactory } from "Database/factories";
import { getAdminToken, getToken } from "Tests/utils";

test.group("courts", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("conseguir listar tribunais", async ({ client }) => {
    const user = await UserFactory.merge({
      password: "password",
      tenant_id: TENANTS.alfa.id,
    }).create();

    await CourtFactory.merge({ tenant_id: TENANTS.alfa.id }).createMany(10);

    const token = await getToken(user.email, "password");
    const response = await client.get("courts").bearerToken(token);

    response.assertStatus(403);
  });

  test("conseguir criar um tribunal", async ({ client }) => {
    const token = await getAdminToken();
    const court = await CourtFactory.merge({ tenant_id: TENANTS.alfa.id }).make();

    const response = await client.post("courts").json(court.toJSON()).bearerToken(token);

    response.assertStatus(200);
    response.assert?.assert(court.toJSON());
    response.assert?.notExists(response.body().tenant_id, "tenant_id exposto");
  });

  test("conseguir atualizar um tribunal", async ({ client }) => {
    const token = await getAdminToken();
    const court = await CourtFactory.merge({ tenant_id: TENANTS.alfa.id }).create();

    const response = await client
      .put(`courts/${court.id}`)
      .json({ ...court.toJSON(), name: "Novo Nome" })
      .bearerToken(token);

    response.assertStatus(200);
    response.assert?.assert({ ...court.toJSON(), name: "Novo Nome" });
    response.assert?.notExists(response.body().tenant_id, "tenant_id exposto");
  });

  test("conseguir deletar um tribunal", async ({ client }) => {
    const token = await getAdminToken();
    const court = await CourtFactory.merge({ tenant_id: TENANTS.alfa.id }).create();

    let response = await client.delete(`courts/${court.id}`).bearerToken(token);
    response.assertStatus(204);
    response = await client.get(`courts/${court.id}`).bearerToken(token);
    console.log(response.body());

    response.assertStatus(404);
  });

  test("não conseguir deletar um tribunal com serviços", async ({ client }) => {
    //TODO implementar
    const token = await getAdminToken();
    const court = await CourtFactory.merge({ tenant_id: TENANTS.alfa.id }).create();
    await CourtFactory.merge({ tenant_id: TENANTS.alfa.id }).create();

    const response = await client.delete(`courts/${court.id}`).bearerToken(token);
    response.assertStatus(400);
  });
});
