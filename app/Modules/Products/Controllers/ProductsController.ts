import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ImageValidator, ProductValidator } from "../Validators";
import { v4 as uuid } from "uuid";
import sharp from "sharp";
import Drive from "@ioc:Adonis/Core/Drive";
import Product from "../Models/Product";
import { ProductService } from "../Services/ProductService";
import Item from "App/Modules/Items/Models/Item";

export default class ProductsController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  public async all() {
    return Product.query().orderBy("name", "asc");
  }

  public async index({ paginate, request }: HttpContextContract) {
    const { page, limit } = paginate;
    const { filter } = request.qs();

    return Product.query()
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("name", "iLike", `%${filter}%`)
      .orderBy("name", "asc")
      .preload("images")
      .paginate(page, limit);
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(ProductValidator);
    const product = await Product.create({ ...data, user_id: auth.user?.id });

    return product;
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Product.query().preload("images").where("id", id).firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(ProductValidator);
    const product = await Product.findOrFail(id);

    await product.merge({ ...data, user_id: auth.user?.id }).save();
    return product;
  }

  public async image({ request, response }: HttpContextContract) {
    const { product_id, file } = await request.validate(ImageValidator);
    const product = await Product.findOrFail(product_id);

    if (product.cover) {
      try {
        Drive.use("s3").delete(`images/${product.cover}`);
        Drive.use("s3").delete(`thumbs/${product.cover}`);
      } catch (error) {
        product.cover = "";
        await product.save();
      }
    }

    try {
      const fileName = `${uuid()}.png`;

      const fileBuffer = await sharp(file.tmpPath)
        .resize(600, 600, {
          fit: "cover",
          position: "center",
        })
        .toBuffer();

      const thumbBuffer = await sharp(file.tmpPath)
        .resize(70, 70, {
          fit: "cover",
          position: "center",
        })
        .toBuffer();

      await Drive.put(`images/${fileName}`, fileBuffer, {
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });

      await Drive.put(`thumbs/${fileName}`, thumbBuffer, {
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });

      const product = await Product.findOrFail(product_id);
      product.cover = fileName;
      await product.save();

      return { avatar: product.cover };
    } catch (error) {
      return response.badRequest({ message: "Não foi possível salvar a imagem.", error });
    }
  }

  public async destroy({ response, params: { id } }: HttpContextContract) {
    const items = await Item.findBy("product_id", id);

    if (items) {
      return response
        .status(400)
        .json({ message: "Você não pode remover um produto que já tenha sido orçado." });
    }

    const product = await Product.findOrFail(id);
    await product.delete();

    return response.status(204);
  }
}
