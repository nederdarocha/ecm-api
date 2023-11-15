import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("orders/tasks/:order_id/by-order", "TaskController.getByOrder").middleware([
    "acl:r-task",
  ]);

  Route.get(
    "orders/tasks/:customer_id/:order_id/by-customer-order",
    "TaskController.getByCustomerOrder"
  ).middleware(["acl:r-task"]);

  Route.post("orders/tasks/:id/confirm-payment", "TaskController.confirmTask").middleware(
    "acl:u-task"
  );
  Route.post("orders/tasks/:id/undo-confirm-payment", "TaskController.undoConfirmTask").middleware(
    "acl:admin"
  );
  Route.resource("orders/tasks", "TaskController").apiOnly().middleware({
    store: "acl:c-task",
    index: "acl:r-task",
    show: "acl:r-task",
    update: "acl:u-task",
    destroy: "acl:d-task",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Orders/Controllers");
