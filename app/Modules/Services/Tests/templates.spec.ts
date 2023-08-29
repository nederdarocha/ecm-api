import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import { getToken } from "Tests/utils";
import { file } from "@ioc:Adonis/Core/Helpers";
import { ServiceFactory, TemplateFactory, UserFactory } from "Database/factories";
import { TENANTS } from "Database/constants";
import Drive from "@ioc:Adonis/Core/Drive";

test.group("templates", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar se usuário sem privilégio tentar acessar os recursos.", async ({ client }) => {
    const user = await UserFactory.merge({ password: "password" }).create();
    const token = await getToken(user.email, "password");

    const resp_store = await client.post("/templates").json({}).bearerToken(token);
    resp_store.assertStatus(403);

    const template = await TemplateFactory.merge({ tenant_id: TENANTS.alfa.id }).create();

    const resp_show = await client.get(`/templates/${template.id}`).bearerToken(token);
    resp_show.assertStatus(403);

    const resp_update = await client
      .put(`/templates/${template.id}`)
      .json({ name: "Novo Nome" })
      .bearerToken(token);

    resp_update.assertStatus(403);
  });

  test("conseguir criar um template", async ({ client }) => {
    const token = await getToken();

    Drive.fake();
    const fileDocx = await file.generateDocx("1mb", "modelo.docx");

    const service = await ServiceFactory.merge({ tenant_id: TENANTS.alfa.id }).create();
    const template = await TemplateFactory.merge({
      service_id: service.id,
    }).make();

    const response = await client
      .post(`/templates`)
      .fields(template.toJSON())
      .file("file", fileDocx.contents, { filename: fileDocx.name })
      .bearerToken(token);

    response.assertStatus(200);
    response.assert?.assert(template.toJSON());
    response.assert?.notExists(response.body().tenant_id, "tenant_id exposto");

    Drive.restore();
  });

  test("falhar ao criar template com o mesmo nome", async ({ client }) => {
    const token = await getToken();

    Drive.fake();
    const fileDocx = await file.generateDocx("1mb", "modelo.docx");

    const service = await ServiceFactory.merge({ tenant_id: TENANTS.alfa.id }).create();
    const template = await TemplateFactory.merge({
      service_id: service.id,
    }).make();

    await client
      .post(`/templates`)
      .fields(template.toJSON())
      .file("file", fileDocx.contents, { filename: fileDocx.name })
      .bearerToken(token);

    const response = await client
      .post(`/templates`)
      .fields(template.toJSON())
      .file("file", fileDocx.contents, { filename: fileDocx.name })
      .bearerToken(token);

    response.assertStatus(422);
    response.assertTextIncludes("Nome informado já está em uso");
  });

  test("conseguir listar todas os templates", async ({ client }) => {
    const token = await getToken();

    await TemplateFactory.mergeRecursive({ tenant_id: TENANTS.alfa.id })
      .with("service", 1)
      .createMany(3);

    const response = await client.get("/templates").bearerToken(token);

    response.assertStatus(200);
  });

  test("conseguir editar um template", async ({ client }) => {
    const token = await getToken();

    const template = await TemplateFactory.with("service", 1).create();

    const response = await client
      .put(`/templates/${template.id}`)
      .json({ ...template, name: "Novo Nome" })
      .bearerToken(token);
    response.assertStatus(200);
    response.assert?.equal(response.body().name, "Novo Nome");
  });

  test("falhar ao editar template com o mesmo nome", async ({ client }) => {
    const token = await getToken();

    const [service, service2] = await TemplateFactory.with("service", 1).createMany(2);

    const response = await client
      .put(`/templates/${service2.id}`)
      .json({
        ...service2.toJSON(),
        name: service.name,
      })
      .bearerToken(token);

    response.assertStatus(422);
    response.assertTextIncludes("Nome informado já está em uso");
  });
});
