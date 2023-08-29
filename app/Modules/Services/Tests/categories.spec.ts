import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import { getToken } from "Tests/utils";
import { CategoryFactory, UserFactory } from "Database/factories";
import { TENANTS } from "Database/constants";

test.group("categories", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar se usuário sem privilégio tentar acessar os recursos.", async ({ client }) => {
    const user = await UserFactory.merge({ password: "password" }).create();
    const token = await getToken(user.email, "password");

    const resp_list = await client.get("/categories/all").bearerToken(token);
    resp_list.assertStatus(403);

    const resp_store = await client.post("/categories").json({}).bearerToken(token);
    resp_store.assertStatus(403);

    const address = await CategoryFactory.create();

    const resp_show = await client.get(`/categories/${address.id}`).bearerToken(token);
    resp_show.assertStatus(403);

    const resp_update = await client
      .put(`/categories/${address.id}`)
      .json({ name: "Novo Nome" })
      .bearerToken(token);

    resp_update.assertStatus(403);
  });

  test("conseguir criar uma categoria", async ({ client }) => {
    const token = await getToken();
    const user = await UserFactory.create();
    const category = await CategoryFactory.merge({
      tenant_id: TENANTS.alfa.id,
      user_id: user.id,
    }).make();

    const response = await client.post(`/categories`).json(category.toJSON()).bearerToken(token);

    response.assertStatus(200);
    response.assert?.assert(category.toJSON());
    response.assert?.notExists(response.body().tenant_id, "tenant_id exposto");
  });

  test("falhar ao criar categorias com o mesmo nome", async ({ client }) => {
    const token = await getToken();

    const category = await CategoryFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).make();

    await client.post(`/categories`).json(category.toJSON()).bearerToken(token);
    const response = await client.post(`/categories`).json(category.toJSON()).bearerToken(token);

    response.assertStatus(422);
    response.assertTextIncludes("Nome informado já está em uso");
  });

  test("conseguir listar todas as categorias", async ({ client }) => {
    const token = await getToken();

    const category = await CategoryFactory.make();
    await client.post("/categories").json(category.toJSON()).bearerToken(token);
    const response = await client.get("/categories/all").bearerToken(token);

    response.assert?.equal(response.body().length, 1);
    response.assertStatus(200);
  });

  test("conseguir editar uma categoria", async ({ client }) => {
    const token = await getToken();

    const [category] = await CategoryFactory.createMany(1);

    const response = await client
      .put(`/categories/${category.id}`)
      .json({
        ...category.toJSON(),
        name: "Novo Nome",
      })
      .bearerToken(token);

    response.assertStatus(200);
    response.assert?.equal(response.body().name, "Novo Nome");
  });

  test("falhar ao editar categorias com o mesmo nome", async ({ client }) => {
    const token = await getToken();

    const [category, category2] = await CategoryFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).createMany(2);

    const response = await client
      .put(`/categories/${category2.id}`)
      .json({
        ...category2.toJSON(),
        name: category.name,
      })
      .bearerToken(token);

    response.assertStatus(422);
    response.assertTextIncludes("Nome informado já está em uso");
  });
});
