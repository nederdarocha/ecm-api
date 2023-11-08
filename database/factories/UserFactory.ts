import User from "App/Modules/Users/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import crypto from "node:crypto";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const UserFactory = Factory.define(User, async ({ faker }) => {
  return {
    tenant_id: TENANTS[faker.helpers.arrayElement(["alfa", "bravo", "charlie"])].id,
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    document: uniqueEnforcer.enforce(() => faker.finance.accountNumber(11)),
    email: uniqueEnforcer.enforce(() => faker.internet.email()),
    phone: uniqueEnforcer.enforce(() => faker.phone.number()),
    password: "secret",
    salt: crypto.randomBytes(16).toString("hex"),
    status: true,
  };
}).build();
