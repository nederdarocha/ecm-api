import { Group, test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { makeAuth } from "Tests/utils";
import { GroupValidator } from "../Validators";
import GroupModel from "App/Modules/Groups/Models/Group";

const userSchema = new GroupValidator();
type GroupAttributes = typeof userSchema.schema.props;

test.group("group", async (group) => {
  // abre uma transação para cada teste
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should be able to list groups", async ({ client }) => {
    const auth = await makeAuth();
    const response = await client.get("groups").qs({ filter: "" }).bearerToken(auth.token);
    response.assertStatus(200);
  });

  test("should be able to create group", async ({ client }) => {
    const auth = await makeAuth();

    const group: GroupAttributes = {
      name: "Bovinos",
      slug: "bovinos",
      order: null,
      status: true,
    };

    const response = await client.post("groups").json(group).bearerToken(auth.token);

    response.assertStatus(200);
    response.assertBodyContains(group);
  });

  test("should be able to not create group with the same name or same slug", async ({ client }) => {
    const auth = await makeAuth();

    const group: GroupAttributes = {
      name: "Bovinos",
      slug: "bovinos",
      order: null,
      status: true,
    };

    await GroupModel.create(group);

    const response = await client.post("groups").json(group).bearerToken(auth.token);
    response.assertStatus(422);
    response.assertBodyContains({
      errors: [
        { field: "name", rule: "unique" },
        { field: "slug", rule: "unique" },
      ],
    });
  });

  test("should be able to update group", async ({ client }) => {
    const auth = await makeAuth();

    const group: GroupAttributes = {
      name: "Bovinos",
      slug: "bovinos",
      order: null,
      status: true,
    };

    const groupUpdated: GroupAttributes = {
      name: "Bovinos2",
      slug: "bovinos2",
      order: 1,
      status: false,
    };

    const _group = await GroupModel.create(group);

    const response = await client
      .put(`groups/${_group.id}`)
      .json(groupUpdated)
      .bearerToken(auth.token);
    response.assertStatus(200);
    response.assertBodyContains(groupUpdated);
  });
});
