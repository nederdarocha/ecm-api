import Status from "App/Modules/Orders/Models/Status";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const StatusFactory = Factory.define(Status, async ({ faker }) => {
  return {
    tenant_id: TENANTS["alfa"].id,
    name: uniqueEnforcer.enforce(() => faker.person.firstName()),
  };
}).build();
