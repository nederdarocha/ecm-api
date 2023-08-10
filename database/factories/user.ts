import User from "App/Modules/Users/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { tenants } from "Database/seeders/00_Tenants";

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    tenant_id: tenants[0].id,
    name: faker.name.firstName(),
    document: faker.helpers.unique(() => faker.finance.account(11)),
    email: faker.internet.email(),
    phone: faker.helpers.unique(() => faker.phone.number("###########")),
    password: faker.internet.password(),
    salt: faker.datatype.number({ min: 1, max: 99 }),
    status: true,
  };
}).build();
