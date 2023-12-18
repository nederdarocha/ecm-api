import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("me", "UserController.me");
  Route.post("profile", "UserController.profile");
  Route.post("users/avatar", "UserController.avatar");
  Route.post("users/change-password", "UserController.changePassword");

  Route.get("users/filter", "UserController.filter").middleware("acl:r-user");
  Route.get("users/last-accesses", "UserController.lastAccesses").middleware("acl:admin");

  Route.resource("users", "UserController").apiOnly().middleware({
    store: "acl:c-user",
    index: "acl:r-user",
    show: "acl:r-user",
    update: "acl:u-user",
    destroy: "acl:d-user",
  });
})
  .middleware(["auth", "sleep:1000"])
  .namespace("App/Modules/Users/Controllers");
