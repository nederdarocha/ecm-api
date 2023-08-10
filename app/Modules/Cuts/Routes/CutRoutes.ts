import Route from "@ioc:Adonis/Core/Route";
Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("cuts", "CutController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-cut"])
  .namespace("App/Modules/Cuts/Controllers");
