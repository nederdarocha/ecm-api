import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("roles/all", "RoleController.all");
  Route.resource("roles", "RoleController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-role"])
  .namespace("App/Modules/Auth/Controllers");
