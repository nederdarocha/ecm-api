import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import Customer from "App/Modules/Customers/Models/Customer";
import { AddressFactory } from "./AddressFactory";
import { UserFactory } from "./UserFactory";
import { DateTime } from "luxon";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const CustomerFactory = Factory.define(Customer, async ({ faker }) => {
  return {
    tenant_id: TENANTS[faker.helpers.arrayElement(["alfa"])].id,
    name: faker.person.fullName(),
    email: uniqueEnforcer.enforce(() => faker.internet.email()),
    phone: uniqueEnforcer.enforce(() => faker.phone.number()),
    document: uniqueEnforcer.enforce(() => faker.finance.accountNumber(11)),
    document_secondary: uniqueEnforcer.enforce(() => faker.finance.accountNumber(11)),
    issuing_agency: faker.helpers.arrayElement(["SSP", "DETRAN", "IFP"]),
    nationality: "Brasileiro",
    natural: true,
    birthday: DateTime.fromJSDate(faker.date.birthdate({ min: 18, max: 65, mode: "age" })),
    gender: faker.helpers.arrayElement(["Masculino", "Feminino"]),
    profession: faker.person.jobTitle(),
    workplace: faker.person.jobTitle(),
    is_indicator: faker.helpers.arrayElement([true, false]),
    commission: faker.helpers.arrayElement([1000, 2000]),
    previdencia_id: faker.finance.accountNumber(8),
    previdencia_password: faker.finance.accountNumber(8),
    proderj_id: faker.finance.accountNumber(8),
    proderj_password: faker.finance.accountNumber(8),
    bank: faker.finance.accountName(),
    branch: faker.finance.accountNumber(4),
    account_number: faker.finance.accountNumber(6),
    pix_key: faker.finance.accountNumber(11),
  };
})
  .relation("created_by", () => UserFactory)
  .relation("addresses", () => AddressFactory)
  .relation("indicator", () => CustomerFactory)
  .build();
