import Status from "App/Modules/Orders/Models/Status";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";

export const StatusFactory = Factory.define(Status, async ({ faker }) => {
  return {
    tenant_id: TENANTS["alfa"].id,
    name: faker.helpers.unique(() => faker.name.firstName()),
  };
}).build();
