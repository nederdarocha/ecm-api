import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/sign-in", "AuthController.signIn");
  Route.post("/refresh", "AuthController.refresh");
  Route.post("/forgot", "AuthController.forgot");
  Route.post("/reset", "AuthController.reset");
  Route.post("/sign-out", "AuthController.signOut").middleware("auth");
})
  .prefix("auth")
  .namespace("App/Modules/Auth/Controllers");
