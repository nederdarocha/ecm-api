import Category from "App/Modules/Services/Models/Category";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const CategoryFactory = Factory.define(Category, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    name: uniqueEnforcer.enforce(() => faker.commerce.department()),
    description: faker.lorem.words(3),
    status: faker.datatype.boolean(),
  };
}).build();
