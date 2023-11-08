import Factory from "@ioc:Adonis/Lucid/Factory";
import Service from "App/Modules/Services/Models/Service";
import { TENANTS } from "Database/constants";
import { CategoryFactory } from "./CategoryFactory";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const ServiceFactory = Factory.define(Service, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    name: uniqueEnforcer.enforce(() => faker.person.jobTitle()),
    description: faker.lorem.words(3),
    out_court: faker.helpers.arrayElement([true, false]),
    price: +faker.commerce.price({ min: 100, max: 1000, dec: 0 }),
    commission: +faker.commerce.price({ min: 10, max: 100, dec: 0 }),
    status: faker.helpers.arrayElement([true, false]),
  };
})
  .relation("category", () => CategoryFactory)
  .build();
