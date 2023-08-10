import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/login", "AuthController.login");
  Route.post("/sign-in", "AuthController.signIn");
  Route.post("/sign-up", "AuthController.signUp");
  Route.post("/refresh", "AuthController.refresh");
  Route.post("/forgot", "AuthController.forgot");
  Route.post("/reset", "AuthController.reset");
  Route.post("/logout", "AuthController.logout").middleware("auth");
})
  .prefix("auth")
  .namespace("App/Modules/Auth/Controllers");
