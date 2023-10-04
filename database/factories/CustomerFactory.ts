import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import Customer from "App/Modules/Customers/Models/Customer";
import { AddressFactory } from "./AddressFactory";
import { UserFactory } from "./UserFactory";
import { DateTime } from "luxon";

export const CustomerFactory = Factory.define(Customer, async ({ faker }) => {
  return {
    tenant_id: TENANTS[faker.helpers.arrayElement(["alfa"])].id,
    name: faker.name.fullName(),
    email: faker.helpers.unique(() => faker.internet.email()),
    phone: faker.helpers.unique(() => faker.phone.number("###########")),
    document: faker.helpers.unique(() => faker.finance.account(11)),
    document_secondary: faker.helpers.unique(() => faker.finance.account(11)),
    issuing_agency: faker.helpers.arrayElement(["SSP", "DETRAN", "IFP"]),
    nationality: "Brasileiro",
    natural: true,
    birthday: DateTime.fromJSDate(faker.date.birthdate({ min: 18, max: 65, mode: "age" })),
    gender: faker.helpers.arrayElement(["Masculino", "Feminino"]),
    profession: faker.name.jobTitle(),
    is_indicator: faker.helpers.arrayElement([true, false]),
    commission: faker.helpers.arrayElement([1000, 2000]),
    previdencia_id: faker.finance.account(8),
    previdencia_password: faker.finance.account(8),
    proderj_id: faker.finance.account(8),
    proderj_password: faker.finance.account(8),
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
