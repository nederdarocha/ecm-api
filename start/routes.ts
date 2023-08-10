import Route from "@ioc:Adonis/Core/Route";

Route.get("/health-check", async () => {
  return { now: new Date() };
});

import "App/Modules/Auth/Routes";
import "App/Modules/Users/Routes";
import "App/Modules/Files/Routes";
import "App/Modules/Products/Routes";
import "App/Modules/Images/Routes";
import "App/Modules/Addresses/Routes";
import "App/Modules/Orders/Routes";
import "App/Modules/Items/Routes";
import "App/Modules/Groups/Routes";
import "App/Modules/Packings/Routes";
import "App/Modules/Cuts/Routes";
import "App/Modules/Portions/Routes";
