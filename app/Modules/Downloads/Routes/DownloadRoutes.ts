import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("customers", "DownloadController.customers");
  Route.get("orders", "DownloadController.orders");
})
  .prefix("/download")
  .middleware(["authByUrl"])
  .namespace("App/Modules/Downloads/Controllers");
