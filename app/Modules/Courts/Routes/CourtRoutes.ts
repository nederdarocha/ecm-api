import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("courts/filter", "CourtController.filter").middleware("acl:r-court");

  Route.resource("courts", "CourtController").apiOnly().middleware({
    store: "acl:c-court",
    index: "acl:r-court",
    show: "acl:r-court",
    update: "acl:u-court",
    destroy: "acl:d-court",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Courts/Controllers");
