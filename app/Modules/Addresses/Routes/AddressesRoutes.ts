import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("addresses/:id/owner", "AddressesController.addresses");
  Route.resource("addresses", "AddressesController").except(["edit", "create"]);
})
  .middleware(["auth"])
  .namespace("App/Modules/Addresses/Controllers");
