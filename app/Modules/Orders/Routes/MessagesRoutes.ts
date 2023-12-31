import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("orders/messages/:order_id/by-order", "MessageController.getByOrder").middleware([
    "acl:r-message",
  ]);
  Route.get(
    "orders/messages/:customer_id/by-customer",
    "MessageController.getByCustomer"
  ).middleware(["acl:r-message"]);

  Route.resource("orders/messages", "MessageController").apiOnly().middleware({
    store: "acl:c-message",
    index: "acl:r-message",
    show: "acl:r-message",
    update: "acl:u-message",
    destroy: "acl:d-message",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Orders/Controllers");
