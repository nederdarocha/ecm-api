import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("orders/:id/customer", "OrderController.addCustomer").middleware(["acl:u-order"]);
  Route.get("orders/:id/customers", "OrderController.getCustomers").middleware(["acl:r-order"]);

  Route.delete(
    "orders/:id/customer/:customer_order_id",
    "OrderController.destroyCustomer"
  ).middleware("acl:d-order");

  Route.group(() => {
    Route.get("services", "OrderController.getServices").middleware("acl:r-order");
    Route.post("service", "OrderController.addService").middleware("acl:u-order");
  }).prefix("orders/:customer_order_id");

  Route.group(() => {
    Route.get("service-extra-data", "OrderController.getServiceExtraData").middleware(
      "acl:u-order"
    );
    Route.put("customer-order-service", "OrderController.updateCustomerOrderService").middleware(
      "acl:u-order"
    );
    Route.delete("service", "OrderController.destroyService").middleware("acl:d-order");
  }).prefix("orders/:customer_order_service_id");

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
