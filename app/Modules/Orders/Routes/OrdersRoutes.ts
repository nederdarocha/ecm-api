import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.group(() => {
    Route.post("customer", "OrderController.addCustomer").middleware(["acl:u-order"]);
    Route.get("customers", "OrderController.getCustomers").middleware(["acl:r-order"]);
    Route.delete("customer/:customer_order_id", "OrderController.destroyCustomer").middleware(
      "acl:d-order"
    );
  }).prefix("orders/:id");

  Route.group(() => {
    Route.get("services", "OrderController.getServices").middleware("acl:r-order");
    Route.post("service", "OrderController.addService").middleware("acl:u-order");
  }).prefix("orders/:customer_order_id");

  Route.group(() => {
    Route.get("service-extra-data", "OrderController.getServiceExtraData").middleware(
      "acl:r-order"
    );
    Route.put("customer-order-service", "OrderController.updateCustomerOrderService").middleware(
      "acl:u-order"
    );
    Route.delete("service", "OrderController.destroyService").middleware("acl:d-order");
  }).prefix("orders/:customer_order_service_id");

  Route.group(() => {
    Route.put("notes", "OrderController.updateNotes").middleware(["acl:u-order"]);
  }).prefix("orders/:id");

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
