import Address from "App/Modules/Addresses/Models/Address";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";
import { UniqueEnforcer } from "enforce-unique";
const uniqueEnforcer = new UniqueEnforcer();

export const AddressFactory = Factory.define(Address, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    name: "Residencial",
    zip: uniqueEnforcer.enforce(() => faker.location.zipCode("#####-###")),
    favorite: true,
    street: faker.location.street(),
    number: faker.location.buildingNumber(),
    complement: faker.lorem.words(3),
    neighborhood: faker.location.city(),
    city: faker.location.city(),
    state: "RJ",
    country: "BR",
    reference: faker.lorem.words(3),
    latitude: +faker.location.latitude(-21, -21, 6),
    longitude: +faker.location.longitude(-43, -43, 6),
  };
}).build();
