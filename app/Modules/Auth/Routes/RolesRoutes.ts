import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("roles/all", "RoleController.all");

  Route.group(() => {
    Route.resource("roles", "RoleController").except(["edit", "destroy"]).middleware({
      store: "acl:sup_admin",
      index: "acl:admin",
      show: "acl:admin",
    });
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Auth/Controllers");
