import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("template-messages/all", "TemplateMessageController.all");
  Route.get("template-messages/:id/:customer_id", "TemplateMessageController.handleTemplate");

  Route.resource("template-messages", "TemplateMessageController").apiOnly().middleware({
    store: "acl:c-template_msg",
    index: "acl:r-template_msg",
    show: "acl:r-template_msg",
    update: "acl:u-template_msg",
    destroy: "acl:d-template_msg",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
