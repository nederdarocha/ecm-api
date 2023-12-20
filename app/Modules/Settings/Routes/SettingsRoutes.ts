import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("settings", "ServiceController").apiOnly().except(["destroy"]);
})
  .middleware(["auth", "acl:sup_admin"])
  .namespace("App/Modules/Settings/Controllers");
