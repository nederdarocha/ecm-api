import Route from "@ioc:Adonis/Core/Route";
Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("portions", "PortionController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-portion"])
  .namespace("App/Modules/Portions/Controllers");
