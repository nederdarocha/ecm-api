import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("payments/:id/by-order-service", "PaymentController.getByOrderService").middleware(
    "acl:r-payment"
  );

  Route.get(
    "payments/:customer_id/:order_id/by-customer-order",
    "PaymentController.getByCustomerOrder"
  ).middleware("acl:r-payment");

  Route.post("payments/:id/made-payment", "PaymentController.madePayment").middleware(
    "acl:u-payment"
  );

  Route.post("payments/:id/undo-payment", "PaymentController.undoPayment").middleware("acl:admin");

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
