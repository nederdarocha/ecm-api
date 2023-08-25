import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.group(() => {
    Route.get("addresses/owner/:id", "AddressesController.addressesOwner").middleware(
      "acl:u-address"
    );
    Route.get("addresses/favorite/:id", "AddressesController.addressesFavorite").middleware(
      "acl:u-address"
    );
    Route.resource("addresses", "AddressesController").apiOnly().middleware({
      store: "acl:c-address",
      index: "acl:r-address",
      show: "acl:r-address",
      update: "acl:u-address",
      destroy: "acl:d-address",
    });
  }).middleware(["sleep:1000"]);
})
  .middleware(["auth"])
  .namespace("App/Modules/Addresses/Controllers");
