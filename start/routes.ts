import Route from "@ioc:Adonis/Core/Route";

Route.get("/health-check", async () => {
  return { now: new Date() };
});

import "App/Modules/Auth/Routes";
import "App/Modules/Users/Routes";
import "App/Modules/Files/Routes";
import "App/Modules/Addresses/Routes";
