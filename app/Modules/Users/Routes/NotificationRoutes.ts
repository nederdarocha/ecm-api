import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("/", "NotificationController.index");
  Route.get("check-all-read", "NotificationController.checkAllRead");
  Route.get("latest-unread", "NotificationController.latestUnread");
  Route.get("me", "NotificationController.me");
})
  .prefix("notifications")
  .middleware("auth")
  .namespace("App/Modules/Users/Controllers");
