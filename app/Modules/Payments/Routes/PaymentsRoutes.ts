import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get(
    "payments/:id/by-customer-order-service",
    "PaymentController.getByCustomerOrderService"
  ).middleware("acl:r-payment");

  Route.resource("payments", "PaymentController").apiOnly().middleware({
    store: "acl:c-payment",
    index: "acl:r-payment",
    show: "acl:r-payment",
    update: "acl:u-payment",
    destroy: "acl:d-payment",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Payments/Controllers");
