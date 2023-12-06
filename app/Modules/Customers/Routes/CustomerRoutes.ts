import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("customers/filter", "CustomerController.filter").middleware("acl:r-customer");
  Route.get("customers/indicators", "CustomerController.indicators").middleware("acl:r-customer");
  Route.post("customers/:id/create-user", "CustomerController.createUser").middleware(
    "acl:c-customer"
  );

  Route.resource("customers", "CustomerController").apiOnly().middleware({
    store: "acl:c-customer",
    index: "acl:r-customer",
    show: "acl:r-customer",
    update: "acl:u-customer",
    destroy: "acl:d-customer",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Customers/Controllers");
