import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("services/all", "ServiceController.all");
  Route.get("services/:id/extra-data/:customer_id", "ServiceController.getExtraData");
  Route.get("services/:id/templates", "ServiceController.getTemplates");

  Route.resource("services", "ServiceController").apiOnly().middleware({
    store: "acl:c-category",
    index: "acl:r-category",
    show: "acl:r-category",
    update: "acl:u-category",
    destroy: "acl:d-category",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
