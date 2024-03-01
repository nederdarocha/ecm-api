import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {

  Route.resource("tasks/type-tasks", "TypeTaskController").apiOnly().middleware({
    store: "acl:admin",
    index: "acl:r-task",
    show: "acl:r-task",
    update: "acl:admin",
    destroy: "acl:admin",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Tasks/Controllers");
