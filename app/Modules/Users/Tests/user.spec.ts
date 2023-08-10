import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import Env from "@ioc:Adonis/Core/Env";
import { makeAuth } from "Tests/utils";
import Drive from "@ioc:Adonis/Core/Drive";
import { file } from "@ioc:Adonis/Core/Helpers";
import { UserStoreValidator } from "../Validators";
import Role from "App/Modules/Auth/Models/Role";
import Mail from "@ioc:Adonis/Addons/Mail";

const userSchema = new UserStoreValidator();
type UserAttributes = typeof userSchema.schema.props;

test.group("users", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list users", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("users").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create user", async ({ client, assert }) => {
    const mailer = Mail.fake();
    const auth = await makeAuth();
    // get role vendedor id
    const roleIdVendor = await Role.findByOrFail("slug", "vend");

    const user: UserAttributes = {
      name: "John doe",
      document: "08931946708",
      phone: "21996381097",
      email: "john@mail.com",
      redirect_url: "app.bento.com",
      role_ids: [roleIdVendor.id],
    };

    const response = await client.post("users").json(user).bearerToken(auth.token);

    assert.isTrue(
      mailer.exists({ from: { address: Env.get("MAIL_FROM"), name: Env.get("MAIL_NAME") } })
    );
    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }));
    assert.isTrue(mailer.exists({ subject: `${Env.get("MAIL_SUBJECT")} - Bem vindo` }));
    assert.isTrue(
      mailer.exists(
        (mail) => mail.html!.includes(user.name) && mail.html!.includes(user.redirect_url)
      )
    );

    response.assertStatus(200);

    const { redirect_url, role_ids, ..._user } = user;
    response.assertBodyContains(_user);
    assert.notExists(response.body().password, "Password defined");
  });

  test("should be able to upload avatar", async ({ client, assert }) => {
    const auth = await makeAuth();
    Drive.fake();
    const fakeAvatar = await file.generatePng("1mb");
    const response = await client
      .post(`/users/avatar`)
      .bearerToken(auth.token)
      .fields({ user_id: auth.user.id })
      .file("file", fakeAvatar.contents, { filename: fakeAvatar.name });

    response.assertStatus(200);
    const avatar = response.body().avatar;
    assert.exists(avatar, "Not result avatar");

    Drive.restore();
  });
});
