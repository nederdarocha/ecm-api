import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("templates", "TemplateController").apiOnly().middleware({
    store: "acl:c-template",
    index: "acl:r-template",
    show: "acl:r-template",
    update: "acl:u-template",
    destroy: "acl:d-template",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
