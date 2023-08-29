import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import { getToken } from "Tests/utils";
import { ServiceFactory, UserFactory } from "Database/factories";
import { TENANTS } from "Database/constants";

test.group("services", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar se usuário sem privilégio tentar acessar os recursos.", async ({ client }) => {
    const user = await UserFactory.merge({ password: "password" }).create();
    const token = await getToken(user.email, "password");

    const resp_list = await client.get("/services/all").bearerToken(token);
    resp_list.assertStatus(403);

    const resp_store = await client.post("/services").json({}).bearerToken(token);
    resp_store.assertStatus(403);

    const service = await ServiceFactory.merge({ tenant_id: TENANTS.alfa.id }).create();

    const resp_show = await client.get(`/services/${service.id}`).bearerToken(token);
    resp_show.assertStatus(403);

    const resp_update = await client
      .put(`/services/${service.id}`)
      .json({ name: "Novo Nome" })
      .bearerToken(token);

    resp_update.assertStatus(403);
  });

  test("conseguir criar um serviço", async ({ client }) => {
    const token = await getToken();

    const service = await ServiceFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).make();

    const response = await client.post(`/services`).json(service.toJSON()).bearerToken(token);

    response.assertStatus(200);
    response.assert?.assert(service.toJSON());
    response.assert?.notExists(response.body().tenant_id, "tenant_id exposto");
  });

  test("falhar ao criar serviço com o mesmo nome", async ({ client }) => {
    const token = await getToken();

    const service = await ServiceFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).make();

    await client.post(`/services`).json(service.toJSON()).bearerToken(token);
    const response = await client.post(`/services`).json(service.toJSON()).bearerToken(token);

    response.assertStatus(422);
    response.assertTextIncludes("Nome informado já está em uso");
  });

  test("conseguir listar todas os serviços", async ({ client }) => {
    const token = await getToken();

    const services = await ServiceFactory.make();
    await client.post("/services").json(services.toJSON()).bearerToken(token);
    const response = await client.get("/services/all").bearerToken(token);

    response.assert?.equal(response.body().length, 1);
    response.assertStatus(200);
  });

  test("conseguir editar um serviço", async ({ client }) => {
    const token = await getToken();

    const [service] = await ServiceFactory.createMany(1);

    const response = await client
      .put(`/services/${service.id}`)
      .json({
        ...service.toJSON(),
        name: "Novo Nome",
      })
      .bearerToken(token);

    response.assertStatus(200);
    response.assert?.equal(response.body().name, "Novo Nome");
  });

  test("falhar ao editar serviço com o mesmo nome", async ({ client }) => {
    const token = await getToken();

    const [service, service2] = await ServiceFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).createMany(2);

    const response = await client
      .put(`/services/${service2.id}`)
      .json({
        ...service2.toJSON(),
        name: service.name,
      })
      .bearerToken(token);

    response.assertStatus(422);
    response.assertTextIncludes("Nome informado já está em uso");
  });
});
