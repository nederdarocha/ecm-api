import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("cases/:id/customer", "CaseController.addCustomer").middleware(["acl:u-case"]);
  Route.resource("cases", "CaseController").apiOnly().middleware({
    store: "acl:c-case",
    index: "acl:r-case",
    show: "acl:r-case",
    update: "acl:u-case",
    destroy: "acl:d-case",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Cases/Controllers");
