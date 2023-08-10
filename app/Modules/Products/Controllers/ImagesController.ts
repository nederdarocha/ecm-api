import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Drive from "@ioc:Adonis/Core/Drive";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

import { ImageValidator } from "../Validators";
import Product from "../Models/Product";
import Image from "../../Images/Models/Image";
import { ProductService } from "../Services/ProductService";

export default class ProductsController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  public async favorite({ auth, params: { id }, response }: HttpContextContract) {
    const image = await Image.findOrFail(id);
    const { order, owner_id } = image;

    const trx = await Database.transaction();
    try {
      await trx
        .from("images")
        .where("owner_id", image.owner_id)
        .andWhere("order", 1)
        .update({ favorite: false, order: order, user_id: auth.user?.id });

      image.useTransaction(trx);
      image.favorite = true;
      image.order = 1;
      await image.save();

      await trx
        .from("products")
        .where("id", image.owner_id)
        .update({ image: image.key, user_id: auth.user?.id });
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      return response
        .status(400)
        .json({ message: "Não foi possível tornar a imagem favorita", error });
    }

    return this.getImages(owner_id);
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { product_id, file } = await request.validate(ImageValidator);
    const _file = request.file("file")!;
    const product = await Product.findOrFail(product_id);
    const order = await this.service.getNextOrderImage(product_id);

    try {
      const fileName = `${uuid()}.png`;

      await _file.moveToDisk(`images`, {
        name: fileName,
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });

      const thumbBuffer = await sharp(file.tmpPath)
        .resize(70, 70, {
          fit: "cover",
          position: "center",
        })
        .toBuffer();

      await Drive.put(`thumbs/${fileName}`, thumbBuffer, {
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });

      // first image is favorite
      if (order === 1) {
        product.image = fileName;
        await product.save();
      }

      await Image.create({
        name: fileName,
        key: fileName,
        owner_id: product_id,
        order,
        favorite: order === 1 ? true : false,
        user_id: auth.user?.id,
      });

      return this.getImages(product_id);
    } catch (error) {
      return response.badRequest({ message: "Não foi possível salvar a imagem.", error });
    }
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const image = await Image.findOrFail(id);
    const { owner_id, order } = image;

    const trx = await Database.transaction();
    try {
      image.useTransaction(trx);
      await image.delete();

      await trx.rawQuery(
        `UPDATE images
        SET user_id= :user_id, favorite=false, "order"= images."order" -1
        WHERE owner_id = :owner_id AND images."order" > :order`,
        { user_id: auth.user?.id!, owner_id, order }
      );

      const isUpdated = await trx
        .from("images")
        .where("owner_id", image.owner_id)
        .andWhere("order", 1)
        .update({ favorite: true, user_id: auth.user?.id });

      if (isUpdated) {
        await trx.rawQuery(
          `UPDATE products
          SET  image=(select images.key from images where images.owner_id = products.id and images.favorite = true limit 1)
          WHERE products.id = :id`,
          { id: owner_id }
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      return response.status(400).json({ message: "Não foi possível remover a imagem", error });
    }

    try {
      Drive.use("s3").delete(`images/${image.key}`);
      Drive.use("s3").delete(`thumbs/${image.key}`);
    } catch (error) {
      return response
        .status(400)
        .json({ message: "Não foi possível remover a imagem no storage", error });
    }

    return this.getImages(owner_id);
  }

  private async getImages(owner_id: string): Promise<Image[]> {
    return await Image.query().where("owner_id", owner_id);
  }
}
