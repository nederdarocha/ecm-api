import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.group(() => {
    Route.get("services", "OrderServiceController.getServices").middleware("acl:r-order");
    Route.post("service", "OrderServiceController.addService").middleware("acl:u-order");
  }).prefix("orders/:customer_order_id");

  Route.group(() => {
    Route.get("service-extra-data", "OrderServiceController.getServiceExtraData").middleware(
      "acl:r-order"
    );
    Route.put(
      "customer-order-service",
      "OrderServiceController.updateCustomerOrderService"
    ).middleware("acl:u-order");
    Route.delete("service", "OrderServiceController.destroyService").middleware("acl:d-order");
  }).prefix("orders/:customer_order_service_id");
})
  .middleware(["auth"])
  .namespace("App/Modules/Orders/Controllers");
