import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import Env from "@ioc:Adonis/Core/Env";
import Mail from "@ioc:Adonis/Addons/Mail";
import { getMe, getToken } from "Tests/utils";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { USERS } from "Database/constants";

test.group("auth", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("falhar por fazer muitas tentativas", async ({}) => {
    console.warn("Não implementado! - falhar por fazer muitas tentativas");
    // const response = await client.post("/auth/sign-in").json({});
    // console.log(response.body());

    // response.assertStatus(422);
    // response.assert?.exists(response.body().errors);
  });

  test("falhar por nao enviar as credencias", async ({ client }) => {
    const response = await client.post("/auth/sign-in").json({});
    // console.log(response.body());

    response.assertStatus(422);
    response.assert?.exists(response.body().errors);
  });

  test("falhar ao enviar as credencias erradas", async ({ client }) => {
    const response = await client.post("/auth/sign-in").json({
      user: "admin@admin.com",
      password: "senha-errada",
    });
    // console.log(response.body());

    response.assertStatus(400);
    response.assert?.deepInclude(response.body(), { message: "Usuário e/ou Senha inválidos" });
  });

  test("conseguir se autenticar", async ({ client }) => {
    const response = await client.post("/auth/sign-in").json({
      user: USERS.admin.email,
      password: USERS.admin.password,
    });

    response.assertStatus(200);
    response.assert?.exists(response.body().token);
    response.assert?.exists(response.body().refreshToken);
  });

  test("falhar ao recuperar senha sem e-mail", async ({ client }) => {
    const response = await client.post("/auth/forgot").json({});
    // console.log(response.body());

    response.assertStatus(422);
    response.assert?.exists(response.body().errors);
  });

  test("conseguir criar email de recuperar senha", async ({ client, assert }) => {
    const EMAIL = USERS.admin.email;
    const mailer = Mail.fake();
    await client.post("/auth/forgot").json({ email: EMAIL });
    const user = await Database.query().from("users").where("email", EMAIL).firstOrFail();

    // console.log(response.body());
    assert.isTrue(
      mailer.exists({ from: { address: Env.get("MAIL_FROM"), name: Env.get("MAIL_NAME") } })
    );
    assert.isTrue(mailer.exists({ to: [{ address: EMAIL }] }));
    assert.isTrue(mailer.exists({ subject: `${Env.get("MAIL_SUBJECT")} - Criar nova senha` }));
    assert.isTrue(mailer.exists((mail) => mail.html!.includes(user.first_name)));
  });

  test("falhar em solicitar por muitas vezes a recuperação de senha", async ({ client }) => {
    const EMAIL = USERS.admin.email;

    let response = await client.post("/auth/forgot").json({ email: EMAIL });
    response.assertStatus(200);

    response = await client.post("/auth/forgot").json({ email: EMAIL });
    response.assertStatus(400);
  });

  test("falhar se o token informado for inválido", async ({ client }) => {
    const PASSWORD = "bbBB**122";

    const responseRestFailure = await client.post("/auth/reset").json({
      token: uuid(),
      password: PASSWORD,
      password_confirmation: PASSWORD,
    });

    responseRestFailure.assertStatus(400);
    responseRestFailure.assert?.deepInclude(responseRestFailure.body(), {
      message: "token inválido ou expirado",
    });
  });

  test("falhar se o token estiver expirado", async ({ client }) => {
    const token = await getToken();
    const user = await getMe(token);
    const PASSWORD = "bbBB**122";

    const responseForgot = await client.post("/auth/forgot").json({ email: user.email });
    responseForgot.assertStatus(200);

    const token_forgot = await Database.query()
      .from("user_tokens")
      .where("user_id", user.id)
      .andWhere("type", "forgot")
      .firstOrFail();

    await Database.from("user_tokens")
      .where("id", token_forgot.id)
      .update({ expires_at: DateTime.now().plus({ hours: -2 }) });

    const responseRest = await client.post("/auth/reset").json({
      token: token_forgot.token,
      password: PASSWORD,
      password_confirmation: PASSWORD,
    });

    responseRest.assertStatus(400);
    responseRest.assert?.deepInclude(responseRest.body(), {
      message: "token inválido ou expirado",
    });
  });

  test("falhar se a senha informada for fraca", async ({ client }) => {
    const token = await getToken();
    const user = await getMe(token);
    const PASSWORD = "123";

    const responseForgot = await client.post("/auth/forgot").json({ email: user.email });
    responseForgot.assertStatus(200);

    const token_forgot = await Database.query()
      .from("user_tokens")
      .where("user_id", user.id)
      .andWhere("type", "forgot")
      .firstOrFail();

    const responseRest = await client.post("/auth/reset").json({
      token: token_forgot.token,
      password: PASSWORD,
      password_confirmation: PASSWORD,
    });

    responseRest.assert?.exists(responseRest.body().errors);
    responseRest.assertStatus(422);
  });

  test("conseguir alterar a senha", async ({ client }) => {
    const token = await getToken();
    const user = await getMe(token);
    const PASSWORD = "bbBB**122";

    const responseForgot = await client.post("/auth/forgot").json({ email: user.email });
    responseForgot.assertStatus(200);

    const token_forgot = await Database.query()
      .from("user_tokens")
      .where("user_id", user.id)
      .andWhere("type", "forgot")
      .firstOrFail();

    const responseRest = await client.post("/auth/reset").json({
      token: token_forgot.token,
      password: PASSWORD,
      password_confirmation: PASSWORD,
    });

    responseRest.assertStatus(200);
  });
});
