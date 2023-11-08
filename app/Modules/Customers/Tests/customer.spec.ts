import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import { getToken } from "Tests/utils";
import { CustomerFactory, UserFactory } from "Database/factories";
import { TENANTS } from "Database/constants";

test.group("customers", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar se usuário sem privilégio tentar acessar os recursos.", async ({ client }) => {
    const user = await UserFactory.merge({ password: "password" }).create();
    const token = await getToken(user.email, "password");

    const resp_store = await client.post("/customers").json({}).bearerToken(token);
    resp_store.assertStatus(403);

    const resp_list = await client.get("customers").bearerToken(token);
    resp_list.assertStatus(403);

    const customer = await CustomerFactory.with("addresses", 2).create();

    const resp_show = await client.get(`/customers/${customer.id}`).bearerToken(token);
    resp_show.assertStatus(403);

    const resp_update = await client
      .put(`/customers/${customer.id}`)
      .json({ name: "John Doe" })
      .bearerToken(token);

    resp_update.assertStatus(403);
  });

  test("conseguir listar clientes", async ({ client }) => {
    const token = await getToken();
    const customer = await CustomerFactory.merge({ tenant_id: TENANTS.alfa.id })
      .with("addresses", 1)
      .create();

    const response = await client
      .get("customers")
      .qs({ filter: customer.document, page: 1, per_page: 9 })
      .bearerToken(token);

    response.assertStatus(200);
    response.assert?.exists(response.body().data);
    response.assert?.exists(response.body().meta);
    response.assert?.assert(response.body().data[0].id, customer.id);
    response.assert?.notExists(response.body().data[0].tenant_id, "tenet_id exposto");
  });

  test("conseguir criar cliente", async ({ client }) => {
    const token = await getToken();
    const user = await CustomerFactory.merge({ tenant_id: TENANTS.alfa.id }).make();

    const response = await client.post("customers").json(user.toJSON()).bearerToken(token);
    // console.log(response.body());

    response.assertStatus(200);

    const { tenant_id, ..._user } = user.toJSON();
    response.assertBodyContains(_user);
  });

  test("conseguir editar cliente", async ({ client }) => {
    const token = await getToken();

    const customer = await CustomerFactory.merge({ tenant_id: TENANTS.alfa.id }).create();
    const customer2 = await CustomerFactory.merge({ tenant_id: TENANTS.alfa.id }).make();
    const { tenant_id, ..._customer } = customer2.toJSON();

    const response = await client
      .put(`customers/${customer.id}`)
      .json(_customer)
      .bearerToken(token);

    response.assertStatus(200);
    response.assertBodyContains(_customer);
  });

  test("falhar ao ver um cliente de tenant diferente", async ({ client }) => {
    const token = await getToken();

    const customer = await CustomerFactory.merge({ tenant_id: TENANTS.bravo.id }).create();
    const response = await client.get(`customers/${customer.id}`).bearerToken(token);

    response.assertStatus(403);
  });

  test("falhar ao editar cliente de tenant diferente", async ({ client }) => {
    const token = await getToken();

    const customer = await CustomerFactory.merge({ tenant_id: TENANTS.bravo.id }).create();

    const response = await client
      .put(`customers/${customer.id}`)
      .json(customer.toJSON())
      .bearerToken(token);

    response.assertStatus(403);
  });

  test("falhar ao criar 2 clientes com dados únicos", async ({ client }) => {
    const token = await getToken();

    const customer = await CustomerFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).create();

    const customer2 = (
      await CustomerFactory.merge({
        tenant_id: TENANTS.alfa.id,
      }).make()
    ).toJSON();

    //cria o segundo usuário com CPF repetido
    let response = await client
      .post("customers")
      .json({ ...customer2, document: customer.document })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("CPF");

    //cria o segundo usuário com documento repetido
    response = await client
      .post("customers")
      .json({ ...customer2, document_secondary: customer.document_secondary })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("documento");

    //cria o segundo usuário com email repetido
    response = await client
      .post("customers")
      .json({ ...customer2, email: customer.email })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("email");

    //cria o segundo usuário com phone repetido
    response = await client
      .post("customers")
      .json({ ...customer2, role_ids: [], phone: customer.phone })
      .bearerToken(token);

    response.assertStatus(400);
    response.assertTextIncludes("celular");
  });

  test("falhar ao editar cliente com dados únicos", async ({ client }) => {
    const token = await getToken();

    const [customer, customer2] = await CustomerFactory.merge({
      tenant_id: TENANTS.alfa.id,
    }).createMany(2);

    //cria o segundo usuário com cpf repetido
    let response = await client
      .put(`customers/${customer.id}`)
      .json({ ...customer.toJSON(), document: customer2.document })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("CPF");

    //cria o segundo usuário com documento repetido
    response = await client
      .put(`customers/${customer.id}`)
      .json({ ...customer.toJSON(), document_secondary: customer2.document_secondary })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("documento");

    //cria o segundo usuário com email repetido
    response = await client
      .put(`customers/${customer.id}`)
      .json({ ...customer.toJSON(), email: customer2.email })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("email");

    //cria o segundo usuário com phone repetido
    response = await client
      .put(`customers/${customer.id}`)
      .json({ ...customer.toJSON(), phone: customer2.phone })
      .bearerToken(token);

    response.assertStatus(400);
    response.assertTextIncludes("celular");
  });
});
