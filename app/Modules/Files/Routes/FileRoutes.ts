import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/download/:id", "FileController.download");
  Route.get("/:id", "FileController.redirect");
})
  .prefix("/files")
  .namespace("App/Modules/Files/Controllers")
  .middleware(["authByUrl"]);

Route.group(() => {
  Route.get("/trash", "FileController.trashIndex").middleware("acl:admin");
  Route.delete("/trash/:id", "FileController.trashDestroy").middleware("acl:admin");
  Route.get("/owner/:id", "FileController.ownerIndex").middleware("acl:r-file");
  Route.put("/:id", "FileController.update").middleware("acl:u-file");
  Route.delete("/:id", "FileController.destroy").middleware("acl:d-file");
  Route.post("/", "FileController.store").middleware("acl:c-file");
})
  .prefix("/files")
  .namespace("App/Modules/Files/Controllers")
  .middleware("auth");
