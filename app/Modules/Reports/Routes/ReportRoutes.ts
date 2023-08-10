import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("items", "Reports/Controllers/ReportController.items");
})
  .middleware("authByUrl")
  .prefix("/reports");
