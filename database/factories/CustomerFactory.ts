import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import Customer from "App/Modules/Customers/Models/Customer";
import { AddressFactory } from "./AddressFactory";
import { UserFactory } from "./UserFactory";

export const CustomerFactory = Factory.define(Customer, async ({ faker }) => {
  return {
    tenant_id: TENANTS[faker.helpers.arrayElement(["alfa", "bravo", "charlie"])].id,
    name: faker.name.fullName(),
    email: faker.helpers.unique(() => faker.internet.email()),
    phone: faker.helpers.unique(() => faker.phone.number("###########")),
    document: faker.helpers.unique(() => faker.finance.account(11)),
    document_secondary: faker.helpers.unique(() => faker.finance.account(11)),
    natural: faker.helpers.arrayElement([true, false]),
    gender: faker.helpers.arrayElement(["Masculino", "Feminino"]),
    bank: faker.finance.accountName(),
    branch: faker.finance.account(4),
    account_number: faker.finance.account(6),
    pix_key: faker.finance.account(11),
  };
})
  .relation("created_by", () => UserFactory)
  .relation("addresses", () => AddressFactory)
  .relation("indicator", () => CustomerFactory)
  .build();
