import Factory from "@ioc:Adonis/Lucid/Factory";
import Service from "App/Modules/Services/Models/Service";
import { TENANTS } from "Database/constants";
import { CategoryFactory } from "./CategoryFactory";

export const ServiceFactory = Factory.define(Service, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    name: faker.name.jobTitle(),
    description: faker.lorem.words(3),
    out_court: faker.helpers.arrayElement([true, false]),
    price: faker.datatype.number(1000),
    commission: faker.datatype.number(1000),
    status: faker.helpers.arrayElement([true, false]),
  };
})
  .relation("category", () => CategoryFactory)
  .build();
