import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/all", "PermissionController.all");

  Route.group(() => {
    Route.put("/related-role/:id", "PermissionController.updateRelatedRole");
    Route.post("/related-role", "PermissionController.storeRelatedRole");
    Route.delete(":id", "PermissionController.destroy");
  }).middleware(["acl:sup_admin"]);

  Route.group(() => {
    Route.put("/partial/:id", "PermissionController.updatePartial").middleware("sleep:1000");
    Route.put(":id", "PermissionController.update");
    Route.post("", "PermissionController.store");
    Route.get("", "PermissionController.index");
  }).middleware("acl:admin");
})
  .prefix("permissions")
  .middleware(["auth"])
  .namespace("App/Modules/Auth/Controllers");
