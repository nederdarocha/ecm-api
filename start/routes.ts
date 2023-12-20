import Route from "@ioc:Adonis/Core/Route";

Route.get("/health-check", async () => {
  return { now: new Date() };
});

import "App/Modules/Auth/Routes";
import "App/Modules/Users/Routes";
import "App/Modules/Files/Routes";
import "App/Modules/Addresses/Routes";
import "App/Modules/Customers/Routes";
import "App/Modules/Services/Routes";
import "App/Modules/Orders/Routes";
import "App/Modules/Courts/Routes";
import "App/Modules/Payments/Routes";
import "App/Modules/Downloads/Routes";
import "App/Modules/Settings/Routes";
