import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("services/:customer_order_service_id/template/:id", "TemplateController.download");
})
  .namespace("App/Modules/Services/Controllers")
  .middleware(["authByUrl"]);
