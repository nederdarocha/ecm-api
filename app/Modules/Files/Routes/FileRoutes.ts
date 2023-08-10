import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/:key", "Files/Controllers/FileController.index");
  Route.post("/", "Files/Controllers/FileController.store");
})
  .middleware("auth")
  .prefix("/files");
