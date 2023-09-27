import Court from "App/Modules/Courts/Models/Courts";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";

export const CourtFactory = Factory.define(Court, async ({ faker }) => {
  return {
    tenant_id: TENANTS["alfa"].id,
    name: faker.helpers.unique(() => faker.name.firstName()),
    initials: faker.helpers.unique(() => faker.name.firstName()),
  };
}).build();
