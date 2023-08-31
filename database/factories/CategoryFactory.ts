import Category from "App/Modules/Services/Models/Category";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";

export const CategoryFactory = Factory.define(Category, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    name: faker.helpers.unique(() => faker.commerce.department()),
    description: faker.lorem.words(3),
    status: faker.datatype.boolean(),
  };
}).build();
