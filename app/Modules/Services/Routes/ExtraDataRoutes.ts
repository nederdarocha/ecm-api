import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.get("extra-data/all", "ExtraDataController.all");
  Route.get("extra-data/service/:service_id", "ExtraDataController.getByService").middleware(
    "acl:r-extra_data"
  );
  Route.resource("extra-data", "ExtraDataController").apiOnly().middleware({
    store: "acl:c-extra_data",
    index: "acl:r-extra_data",
    show: "acl:r-extra_data",
    update: "acl:u-extra_data",
    destroy: "acl:d-extra_data",
  });
})
  .middleware(["auth"])
  .namespace("App/Modules/Services/Controllers");
