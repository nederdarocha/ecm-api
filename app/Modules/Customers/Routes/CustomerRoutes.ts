import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.group(() => {
    Route.resource("customers", "CustomerController").apiOnly().except(["destroy"]);
  }).middleware(["acl:crud-customer"]);
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Customers/Controllers");
