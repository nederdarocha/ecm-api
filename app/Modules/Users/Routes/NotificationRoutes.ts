import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("/", "NotificationController.index");
  Route.get("/:id", "NotificationController.show");
  Route.get("mark-all-read", "NotificationController.markAllRead");
  Route.get("latest-unread", "NotificationController.latestUnread");
})
  .prefix("notifications")
  .middleware("auth")
  .namespace("App/Modules/Users/Controllers");
