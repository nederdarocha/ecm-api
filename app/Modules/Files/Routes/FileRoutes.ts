import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/download/:id", "FileController.download");
  Route.get("/:id", "FileController.redirect");
})
  .prefix("/files")
  .namespace("App/Modules/Files/Controllers")
  .middleware(["authByUrl"]);

Route.group(() => {
  Route.get("/owner/:id", "FileController.ownerIndex");
  Route.put("/:id", "FileController.update");
  Route.delete("/:id", "FileController.destroy");
  Route.post("/", "FileController.store");
})
  .prefix("/files")
  .namespace("App/Modules/Files/Controllers")
  .middleware("auth");
