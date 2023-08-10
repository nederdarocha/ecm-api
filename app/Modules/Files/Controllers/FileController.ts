import sharp from "sharp";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Drive from "@ioc:Adonis/Core/Drive";

import { FileStoreValidator } from "../Validators";

export default class FilesController {
  public async store({ request, response }: HttpContextContract) {
    const { file } = await request.validate(FileStoreValidator);

    const fileBuffer = await sharp(file.tmpPath)
      .resize(150, 150, {
        fit: "cover",
        position: "center",
      })
      .toBuffer();

    try {
      await Drive.put("name_file2.png", fileBuffer, {
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });
    } catch (error) {
      console.log(error);
    }

    response.status(200);
  }
}
