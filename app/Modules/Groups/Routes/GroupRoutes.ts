import Route from "@ioc:Adonis/Core/Route";
Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("groups", "GroupController").except(["edit", "create"]);
})
  .middleware(["auth", "acl:crud-group"])
  .namespace("App/Modules/Groups/Controllers");
