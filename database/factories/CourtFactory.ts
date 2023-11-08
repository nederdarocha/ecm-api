import Court from "App/Modules/Courts/Models/Courts";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const CourtFactory = Factory.define(Court, async ({ faker }) => {
  return {
    tenant_id: TENANTS["alfa"].id,
    name: uniqueEnforcer.enforce(() => faker.person.firstName()),
    initials: uniqueEnforcer.enforce(() => faker.person.lastName()),
  };
}).build();
