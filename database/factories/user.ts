import User from "App/Modules/Users/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import bcrypt from "bcrypt";

export const UserFactory = Factory.define(User, async ({ faker }) => {
  const salt = await bcrypt.genSalt(10);

  return {
    tenant_id: TENANTS[faker.helpers.arrayElement(["alfa", "bravo", "charlie"])].id,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    document: faker.helpers.unique(() => faker.finance.account(11)),
    email: faker.helpers.unique(() => faker.internet.email()),
    phone: faker.helpers.unique(() => faker.phone.number("###########")),
    password: "secret",
    salt,
    status: true,
  };
}).build();
