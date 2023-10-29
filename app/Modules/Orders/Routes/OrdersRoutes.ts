import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.group(() => {
    Route.put("notes", "OrderController.updateNotes").middleware(["acl:u-order"]);
  }).prefix("orders/:id");

  Route.group(() => {
    Route.get("by-customer", "OrderController.getByCustomer").middleware(["acl:r-order"]);
  }).prefix("orders/:customer_id");

  Route.resource("orders", "OrderController").apiOnly().middleware({
    store: "acl:c-order",
    index: "acl:r-order",
    show: "acl:r-order",
    update: "acl:u-order",
    destroy: "acl:d-order",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Orders/Controllers");
