import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("orders/tasks/:order_id/by-order", "TaskController.getByOrder").middleware([
    "acl:r-task",
  ]);
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
