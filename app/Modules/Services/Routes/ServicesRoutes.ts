import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("services/all", "ServiceController.all");
  Route.get("services/:id/extra-data/:customer_id", "ServiceController.getExtraData");

  Route.resource("services", "ServiceController").apiOnly().middleware({
    store: "acl:c-service",
    index: "acl:r-service",
    show: "acl:r-service",
    update: "acl:u-service",
    destroy: "acl:d-service",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
