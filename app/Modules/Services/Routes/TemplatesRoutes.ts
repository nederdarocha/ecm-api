import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("templates/:id/:order_service_id/:customer_id", "TemplateController.download");
})
  .namespace("App/Modules/Services/Controllers")
  .middleware(["authByUrl"]);

Route.group(() => {
  Route.get("templates/:service_id", "TemplateController.getTemplatesByServiceId").middleware(
    "acl:r-order"
  );
})
  .namespace("App/Modules/Services/Controllers")
  .middleware(["auth"]);
