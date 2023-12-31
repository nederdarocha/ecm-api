import Env from "@ioc:Adonis/Core/Env";
import Database from "@ioc:Adonis/Lucid/Database";
import Drive from "@ioc:Adonis/Core/Drive";
import { file } from "@ioc:Adonis/Core/Helpers";
import { test } from "@japa/runner";
import Role from "App/Modules/Auth/Models/Role";
import Mail from "@ioc:Adonis/Addons/Mail";
import { getToken, getMe } from "Tests/utils";
import { UserValidator } from "../Validators";
import User from "../Models/User";
import { UserFactory } from "Database/factories";
import { TENANTS, USERS } from "Database/constants";

const userSchema = new UserValidator();
type UserAttributes = typeof userSchema.schema.props;

test.group("users", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar se usuário sem privilégio tentar acessar os recursos.", async ({ client }) => {
    const [user, user2] = await UserFactory.mergeRecursive({
      tenant_id: TENANTS.alfa.id,
      password: "secret",
    }).createMany(2);
    const token = await getToken(user.email, "secret");

    const resp_store = await client.post(`/users`).json({}).bearerToken(token);
    resp_store.assertStatus(403);

    const resp_list = await client.get("users").bearerToken(token);
    resp_list.assertStatus(403);

    const resp_show = await client.get(`/users/${user2.id}`).bearerToken(token);
    resp_show.assertStatus(403);

    const resp_update = await client
      .put(`/users/${user2.id}`)
      .json({ name: "John Doe" })
      .bearerToken(token);
    resp_update.assertStatus(403);
  });

  test("conseguir listar usuários", async ({ client }) => {
    const token = await getToken();
    const response = await client
      .get("users")
      .qs({ filter: "", page: 1, per_page: 9 })
      .bearerToken(token);
    // console.log(response.status());
    // console.log(response.body());

    response.assertStatus(200);
    response.assert?.exists(response.body().data);
    response.assert?.exists(response.body().meta);
    response.assert?.notExists(response.body().data[0].password, "password exposta");
    response.assert?.notExists(response.body().data[0].tenant_id, "tenet_id exposto");
  });

  test("falhar ao criar 2 usuários com dados únicos", async ({ client }) => {
    const token = await getToken();

    const [user, user2] = await UserFactory.mergeRecursive({
      tenant_id: TENANTS.alfa.id,
    }).createMany(2);

    await user2.delete();

    //cria o usuário
    await client.post("users").json(user).bearerToken(token);

    //cria o segundo usuário com documento repetido
    let response = await client
      .post("users")
      .json({ ...user2, role_ids: [], document: user.document })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("CPF");

    //cria o segundo usuário com email repetido
    response = await client
      .post("users")
      .json({ ...user2, role_ids: [], email: user.email })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("email");

    //cria o segundo usuário com phone repetido
    response = await client
      .post("users")
      .json({ ...user2, role_ids: [], phone: user.phone })
      .bearerToken(token);

    response.assertStatus(400);
    response.assertTextIncludes("celular");
  });

  test("falhar ao editar usuário com dados únicos", async ({ client }) => {
    const token = await getToken();
    const [user, user2, user3] = await UserFactory.mergeRecursive({
      tenant_id: TENANTS.alfa.id,
    }).createMany(3);

    await user2.delete();

    let response = await client
      .put(`users/${user3.id}`)
      .json({ ...user2, role_ids: [], document: user.document })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("CPF");

    //cria o segundo usuário com email repetido
    response = await client
      .put(`users/${user3.id}`)
      .json({ ...user2, role_ids: [], email: user.email })
      .bearerToken(token);
    response.assertStatus(400);
    response.assertTextIncludes("email");

    //cria o segundo usuário com phone repetido
    response = await client
      .put(`users/${user3.id}`)
      .json({ ...user2, role_ids: [], phone: user.phone })
      .bearerToken(token);

    response.assertStatus(400);
    response.assertTextIncludes("celular");
  });

  test("conseguir criar usuário", async ({ client, assert }) => {
    const mailer = Mail.fake();
    const token = await getToken();
    // get role supporter
    const roleIdSupporter = await Role.findByOrFail("slug", "supp");

    const user: UserAttributes = {
      first_name: "John",
      last_name: "Doe",
      document: "08931946708",
      phone: "21996381097",
      email: "john@mail.com",
      role_ids: [roleIdSupporter.id],
      status: true,
      customer_id: null,
    };

    const response = await client.post("users").json(user).bearerToken(token);
    response.assertStatus(200);

    assert.isTrue(
      mailer.exists({ from: { address: Env.get("MAIL_FROM"), name: Env.get("MAIL_NAME") } })
    );
    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }));
    assert.isTrue(mailer.exists({ subject: `${Env.get("MAIL_SUBJECT")} - Bem vindo` }));
    assert.isTrue(mailer.exists((mail) => mail.html!.includes(user?.first_name!)));

    const { role_ids, ..._user } = user;
    response.assertBodyContains(_user);
    assert.notExists(response.body().password, "hash password exposta");
    assert.notExists(response.body().tenant_id, "tenet_id exposto");
    assert.notExists(response.body().salt, "salt exposto");
  });

  test("conseguir o upload avatar", async ({ client, assert }) => {
    const token = await getToken();
    const user = await getMe(token);

    Drive.fake();
    const fakeAvatar = await file.generatePng("1mb");
    const response = await client
      .post(`/users/avatar`)
      .bearerToken(token)
      .fields({ user_id: user.id })
      .file("file", fakeAvatar.contents, { filename: fakeAvatar.name });

    response.assertStatus(200);
    const avatar = response.body().avatar;
    assert.exists(avatar, "Not result avatar");

    Drive.restore();
  });

  test("conseguir editar usuário", async ({ client }) => {
    const token = await getToken();
    const user = await UserFactory.merge({ tenant_id: TENANTS.alfa.id }).create();
    const _user = user.toJSON();

    const response = await client
      .put(`users/${user.id}`)
      .json({ ..._user, first_name: "Nome Alterado", role_ids: [] })
      .bearerToken(token);

    response.assertStatus(200);
    response.assert?.deepInclude(response.body(), { first_name: "Nome Alterado" });
  });

  test("falhar ao ver um usuário de tenant diferente", async ({ client }) => {
    const token = await getToken();

    const user = await User.query().where("tenant_id", "!=", USERS.admin.tenant_id).firstOrFail();
    const response = await client.get(`users/${user.id}`).bearerToken(token);

    response.assertStatus(403);
  });

  test("falhar ao editar usuário de tenant diferente", async ({ client }) => {
    const token = await getToken();

    const user = await User.query().where("tenant_id", "!=", USERS.admin.tenant_id).firstOrFail();
    const _user = user.toJSON();

    const response = await client
      .put(`users/${user.id}`)
      .json({ ..._user, name: "Nome Alterado", role_ids: [] })
      .bearerToken(token);

    response.assertStatus(403);
  });

  test("falhar em alterar senha usando uma senha fraca", async ({ client }) => {
    const token = await getToken();

    const pass = {
      password: Env.get("USER_PASSWORD", "secret"),
      new_password: "12345678",
      new_password_confirmation: "12345678",
    };

    const response = await client.post("users/change-password ").json(pass).bearerToken(token);
    // console.log(response.status());
    // console.log(response.body());

    response.assertStatus(422);
    response.assert?.exists(response.body().errors);
  });

  test("conseguir alterar senha", async ({ client, assert }) => {
    const mailer = Mail.fake();
    const token = await getToken();
    const user = await getMe(token);

    const pass = {
      password: Env.get("USER_PASSWORD", "secret"),
      new_password: "aaAA11@@",
      new_password_confirmation: "aaAA11@@",
    };

    const response = await client.post("users/change-password ").json(pass).bearerToken(token);
    response.assertStatus(200);

    assert.isTrue(
      mailer.exists({ from: { address: Env.get("MAIL_FROM"), name: Env.get("MAIL_NAME") } })
    );
    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }));
    assert.isTrue(mailer.exists({ subject: `${Env.get("MAIL_SUBJECT")} - Senha alterada` }));
    assert.isTrue(mailer.exists((mail) => mail.html!.includes(user.name)));
  });
});
