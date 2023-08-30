import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("services/all", "ServiceController.all").middleware("acl:r-service");
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