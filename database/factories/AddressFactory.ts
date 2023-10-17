import Address from "App/Modules/Addresses/Models/Address";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { TENANTS } from "Database/constants";

export const AddressFactory = Factory.define(Address, ({ faker }) => {
  return {
    tenant_id: TENANTS.alfa.id,
    name: "Residencial",
    zip: faker.helpers.unique(() => faker.address.zipCode("#####-###")),
    favorite: true,
    street: faker.address.street(),
    number: faker.address.buildingNumber(),
    complement: faker.lorem.words(3),
    neighborhood: faker.address.cityName(),
    city: faker.address.cityName(),
    state: "RJ",
    country: "BR",
    reference: faker.lorem.words(3),
    latitude: +faker.address.latitude(-21, -21, 6),
    longitude: +faker.address.longitude(-43, -43, 6),
  };
}).build();
