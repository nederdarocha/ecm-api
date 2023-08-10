import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("permissions/all", "PermissionController.all");
  Route.resource("permissions", "PermissionController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-permission"])
  .namespace("App/Modules/Auth/Controllers");
