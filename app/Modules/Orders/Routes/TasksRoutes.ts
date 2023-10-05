import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("orders/tasks", "TasksController").apiOnly().middleware({
    store: "acl:c-tasks",
    index: "acl:r-tasks",
    show: "acl:r-tasks",
    update: "acl:u-tasks",
    destroy: "acl:d-tasks",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Orders/Controllers");
