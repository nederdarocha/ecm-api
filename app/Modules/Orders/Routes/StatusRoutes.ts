import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("orders/status", "StatusController").apiOnly().middleware({
    store: "acl:c-status",
    index: "acl:r-status",
    show: "acl:r-status",
    update: "acl:u-status",
    destroy: "acl:d-status",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Orders/Controllers");
