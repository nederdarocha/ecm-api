import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { FileStoreValidator } from "../Validators";
import File from "../Models/File";

export default class FilesController {
  public async store({ auth, request, response }: HttpContextContract) {
    const { file, owner_id } = await request.validate(FileStoreValidator);

    const _file = await File.create({
      owner_id,
      tenant_id: auth.user!.tenant_id,
      name: file.fieldName,
      type: file.extname,
      user_id: auth.user?.id,
      is_public: false,
    });

    const s3 = await file.moveToDisk(
      "/customers",
      {
        name: `${_file.id}.${file.extname}`,
        visibility: "private",
        cacheControl: "public,max-age=290304000",
      },
      "s3"
    );

    console.log({ s3 });

    response.status(200);
  }
}
