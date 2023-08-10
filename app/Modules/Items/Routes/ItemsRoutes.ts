import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.post("orders/items/update-parts", "ItemsController.updateParts");
  Route.resource("orders/items", "ItemsController").except(["edit", "create"]);
})
  .middleware(["auth"])
  .namespace("App/Modules/Orders/Controllers");
