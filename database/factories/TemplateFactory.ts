import Factory from "@ioc:Adonis/Lucid/Factory";
import Template from "App/Modules/Services/Models/Template";
import { TENANTS } from "Database/constants";
import { ServiceFactory } from "./ServiceFactory";

export const TemplateFactory = Factory.define(Template, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    order: faker.datatype.number(1000),
    name: faker.name.jobTitle(),
    description: faker.lorem.words(3),
  };
})
  .relation("service", () => ServiceFactory)
  .build();
