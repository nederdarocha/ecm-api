import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("customers", "DownloadController.customers");
})
  .prefix("/download")
  .middleware(["authByUrl"])
  .namespace("App/Modules/Downloads/Controllers");
