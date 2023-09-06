import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("cases/:id/customer", "CaseController.addCustomer").middleware(["acl:u-case"]);
  Route.get("cases/:id/customers", "CaseController.getCustomers").middleware(["acl:r-case"]);
  Route.delete("cases/:id/customer/:customer_id", "CaseController.destroyCustomer").middleware(
    "acl:u-case"
  );

  Route.post("cases/:id/service", "CaseController.addService").middleware(["acl:u-case"]);
  Route.get("cases/:id/services", "CaseController.getServices").middleware(["acl:r-case"]);
  Route.delete("cases/:id/service/:service_id", "CaseController.destroyService").middleware(
    "acl:u-case"
  );

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
