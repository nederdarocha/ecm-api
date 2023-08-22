import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.group(() => {
    Route.get("addresses/owner/:id", "AddressesController.addressesOwner");
    Route.get("addresses/favorite/:id", "AddressesController.addressesFavorite");
    Route.resource("addresses", "AddressesController").apiOnly();
  }).middleware(["acl:crud-address", "sleep:1000"]);
})
  .middleware(["auth"])
  .namespace("App/Modules/Addresses/Controllers");
