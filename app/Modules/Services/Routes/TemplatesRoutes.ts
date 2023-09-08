import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("/template/:id", "FileController.download");
})
  .prefix("/services")
  .namespace("App/Modules/Services/Controllers")
  .middleware(["authByUrl"]);
