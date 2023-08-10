import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("orders/producing", "OrdersController.listProducing");
  Route.get("orders/late-orders", "OrdersController.listLate");
  Route.get("orders/waiting", "OrdersController.listWaiting");
  Route.get("orders/list/:filter", "OrdersController.list");
  Route.post("orders/accept/:id", "OrdersController.accept");

  Route.resource("orders", "OrdersController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-order"])
  .namespace("App/Modules/Orders/Controllers");
