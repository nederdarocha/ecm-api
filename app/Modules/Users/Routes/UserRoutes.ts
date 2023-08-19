import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("me", "UserController.me");
  Route.post("profile", "UserController.profile");
  Route.post("users/avatar", "UserController.avatar");
  Route.post("users/change-password", "UserController.changePassword");

  Route.group(() => {
    Route.resource("users", "UserController").except(["edit", "create"]);
  }).middleware("acl:crud-user");
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Users/Controllers");
