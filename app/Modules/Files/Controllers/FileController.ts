import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { FileStoreValidator, FileUpdateValidator } from "../Validators";
import File from "../Models/File";
import Drive from "@ioc:Adonis/Core/Drive";
import User from "App/Modules/Users/Models/User";
import { FileService } from "../Services/FileService";

export default class FilesController {
  private service;

  constructor() {
    this.service = new FileService();
  }

  public async ownerIndex({ auth, params: { id } }: HttpContextContract) {
    const files = await File.query()
      .select("id", "name", "type", "content_type", "is_public", "size", "created_at", "user_id")
      .preload("user", (q) => q.select("id", "first_name", "last_name"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", id)
      .orderBy("name", "asc");

    return files;
  }

  public async download({ userID, response, params: { id } }: HttpContextContract) {
    const user = await User.findOrFail(userID);
    const file = await File.query()
      .where("tenant_id", user.tenant_id)
      .where("id", id)
      .firstOrFail();

    response.attachment(file.name);
    response.header("Content-Type", file.content_type);
    response.type("application/octet-stream");

    const readableStream = await Drive.getStream(file.key);
    const chunks: Array<string | Buffer> = [];
    for await (const chunk of readableStream) {
      chunks.push(chunk!);
    }

    const buffer = Buffer.concat(chunks as Uint8Array[]);
    response.send(buffer);
  }

  public async redirect({ userID, response, params: { id } }: HttpContextContract) {
    const user = await User.findOrFail(userID);
    const file = await File.query()
      .where("tenant_id", user.tenant_id)
      .where("id", id)
      .firstOrFail();

    //TODO avaliar anotar a url assina e criar um proxy para não exibir o s3
    const signedUrl = await Drive.getSignedUrl(decodeURIComponent(file.key), {
      expiresIn: "15m",
    });

    return response.redirect(signedUrl);
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { file, owner_id } = await request.validate(FileStoreValidator);
    const name = await this.service.generateName({ auth, request });

    const _file = await File.create({
      owner_id,
      tenant_id: auth.user!.tenant_id,
      name,
      type: file.extname,
      user_id: auth.user?.id,
      content_type: file.headers["content-type"],
      is_public: false,
      size: file.size,
    });

    try {
      await file.moveToDisk(
        "customers",
        {
          name: `${_file.id}.${file.extname}`,
          visibility: "private",
          cacheControl: "public,max-age=290304000",
        },
        "s3"
      );

      await _file.merge({ key: `customers/${_file.id}.${file.extname}` }).save();
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }

    response.status(200);
  }

  public async update({ auth, params: { id }, request, response }: HttpContextContract) {
    const { name } = await request.validate(FileUpdateValidator);

    const file = await File.query()
      .where("tenant_id", auth.user!.tenant_id)
      .where("id", id)
      .firstOrFail();

    const isFileNameExist = await this.service.isFileNameExist({ auth, file, name });
    if (isFileNameExist) {
      return response.status(400).json({ message: isFileNameExist.message });
    }

    await file.merge({ name }).save();
    response.status(200);
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const file = await File.query()
      .where("tenant_id", auth.user!.tenant_id)
      .where("id", id)
      .firstOrFail();

    try {
      await Drive.delete(file.key);
      await file.delete();
      response.status(204);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }
}
