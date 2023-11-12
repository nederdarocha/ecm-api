import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.group(() => {
    Route.post("service", "OrderServiceController.addService").middleware("acl:u-order");
    Route.get("services", "OrderServiceController.getServices").middleware("acl:r-order");
  }).prefix("orders/:order_id");

  Route.group(() => {
    Route.get("service-extra-data", "OrderServiceController.getServiceExtraData").middleware(
      "acl:r-order"
    );
    Route.put("order-service", "OrderServiceController.updateOrderService").middleware(
      "acl:u-order"
    );
    Route.put("meta-data", "OrderServiceController.updateMetaData").middleware("acl:u-order");
    Route.delete("service", "OrderServiceController.destroyService").middleware("acl:d-order");
  }).prefix("orders/:order_service_id");
})
  .middleware(["auth"])
  .namespace("App/Modules/Orders/Controllers");
