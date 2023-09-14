import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.put("meta-data/service/:id", "MetaDataController.update").middleware("acl:r-extra_data");
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
