import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("addresses/owner/:id", "AddressesController.addressesOwner");

  Route.group(() => {
    Route.resource("addresses", "AddressesController").apiOnly();
  }).middleware(["acl:crud-address"]);
})
  .middleware(["auth"])
  .namespace("App/Modules/Addresses/Controllers");
