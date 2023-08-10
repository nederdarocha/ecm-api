import Route from "@ioc:Adonis/Core/Route";

Route.where("id", Route.matchers.uuid());

Route.group(() => {
  Route.resource("products", "ProductsController").except(["edit", "create"]);

  Route.group(() => {
    Route.post("", "ImagesController.store");
    Route.delete(":id", "ImagesController.destroy");
    Route.get("favorite/:id", "ImagesController.favorite");
  }).prefix("products/images");
})
  .middleware(["auth", "acl:crud-product"])
  .namespace("App/Modules/Products/Controllers");
