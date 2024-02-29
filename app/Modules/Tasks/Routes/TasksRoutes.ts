import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  // TypeTaskController
  Route.get("tasks/type-tasks", "TypeTaskController.index").middleware(["acl:r-task"]);

  // TaskUserController
  Route.get("tasks/users", "TaskUserController.getAllUsers").middleware(["acl:r-task"]);

  // TaskController
  Route.get("tasks/:order_id/by-order", "TaskController.getByOrder").middleware(["acl:r-task"]);
  Route.get(
    "tasks/:customer_id/:order_id/by-customer-order",
    "TaskController.getByCustomerOrder"
  ).middleware(["acl:r-task"]);

  Route.post("tasks/:id/confirm-task", "TaskController.confirmTask").middleware("acl:u-task");
  Route.post("tasks/:id/undo-confirm-task", "TaskController.undoConfirmTask").middleware(
    "acl:admin"
  );
  Route.resource("tasks", "TaskController").apiOnly().middleware({
    store: "acl:c-task",
    index: "acl:r-task",
    show: "acl:r-task",
    update: "acl:u-task",
    destroy: "acl:d-task",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Tasks/Controllers");
