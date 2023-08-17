import User from "App/Modules/Users/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { tenants } from "Database/seeders/00_Tenants";
import bcrypt from "bcrypt";

export const UserFactory = Factory.define(User, async ({ faker }) => {
  const salt = await bcrypt.genSalt(10);

  return {
    tenant_id: tenants[faker.helpers.arrayElement([0, 1, 2])].id,
    name: faker.name.firstName(),
    document: faker.helpers.unique(() => faker.finance.account(11)),
    email: faker.helpers.unique(() => faker.internet.email()),
    phone: faker.helpers.unique(() => faker.phone.number("###########")),
    password: "secret",
    salt,
    status: true,
  };
}).build();
