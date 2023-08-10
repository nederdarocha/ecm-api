import Route from "@ioc:Adonis/Core/Route";
import Env from "@ioc:Adonis/Core/Env";

Route.get("/images/:folder/:key", async ({ params, response }) => {
  const { folder, key } = params;
  const url = `https://${Env.get("S3_BUCKET")}.s3.amazonaws.com/${folder}/${key}`;

  return response.redirect(url);
});

Route.group(() => {
  Route.get("/:key", "Files/Controllers/ImageController.index");
  Route.post("/", "Files/Controllers/ImageController.store");
})
  .middleware("auth")
  .prefix("/images");
