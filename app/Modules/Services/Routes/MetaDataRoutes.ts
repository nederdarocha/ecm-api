import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.put("meta-data", "MetaDataController.update").middleware("acl:u-meta_data");
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
