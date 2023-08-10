import Route from "@ioc:Adonis/Core/Route";
Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("packings", "PackingController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-packing"])
  .namespace("App/Modules/Packings/Controllers");
