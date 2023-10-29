import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.group(() => {
    Route.post("customer", "OrderCustomerController.addCustomer").middleware(["acl:u-order"]);
    Route.get("customers", "OrderCustomerController.getCustomers").middleware(["acl:r-order"]);
    Route.delete(
      "customer/:customer_order_id",
      "OrderCustomerController.destroyCustomer"
    ).middleware("acl:d-order");
  }).prefix("orders/:id");
})
  .middleware(["auth"])
  .namespace("App/Modules/Orders/Controllers");
