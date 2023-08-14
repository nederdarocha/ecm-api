import Env from "@ioc:Adonis/Core/Env";
import Database from "@ioc:Adonis/Lucid/Database";
import Drive from "@ioc:Adonis/Core/Drive";
import { file } from "@ioc:Adonis/Core/Helpers";
import { test } from "@japa/runner";
import Role from "App/Modules/Auth/Models/Role";
import Mail from "@ioc:Adonis/Addons/Mail";
import { getToken, getMe } from "Tests/utils";
import { UserStoreValidator } from "../Validators";

const userSchema = new UserStoreValidator();
type UserAttributes = typeof userSchema.schema.props;

test.group("users", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("conseguir listar usuários", async ({ client }) => {
    const token = await getToken();
    const response = await client
      .get("users")
      .qs({ filter: "", page: 1, per_page: 9 })
      .bearerToken(token);
    console.log(response.body());

    response.assertStatus(200);
    response.assert?.exists(response.body().data);
    response.assert?.exists(response.body().meta);
    response.assert?.notExists(response.body().data[0].password, "password exposta");
    response.assert?.notExists(response.body().data[0].tenant_id, "tenet_id exposto");
  });

  test("conseguir criar usuário", async ({ client, assert }) => {
    const mailer = Mail.fake();
    const token = await getToken();
    // get role supporter
    const roleIdSupporter = await Role.findByOrFail("slug", "supp");

    const user: UserAttributes = {
      name: "John doe",
      document: "08931946708",
      phone: "21996381097",
      email: "john@mail.com",
      role_ids: [roleIdSupporter.id],
    };

    const response = await client.post("users").json(user).bearerToken(token);
    response.assertStatus(200);

    assert.isTrue(
      mailer.exists({ from: { address: Env.get("MAIL_FROM"), name: Env.get("MAIL_NAME") } })
    );
    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }));
    assert.isTrue(mailer.exists({ subject: `${Env.get("MAIL_SUBJECT")} - Bem vindo` }));
    assert.isTrue(mailer.exists((mail) => mail.html!.includes(user.name)));

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
});
