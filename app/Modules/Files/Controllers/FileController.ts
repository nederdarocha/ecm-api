import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { FileStoreValidator } from "../Validators";
import File from "../Models/File";
import Drive from "@ioc:Adonis/Core/Drive";
import User from "App/Modules/Users/Models/User";

export default class FilesController {
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

    const _file = await File.create({
      owner_id,
      tenant_id: auth.user!.tenant_id,
      name: file.clientName,
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
}
