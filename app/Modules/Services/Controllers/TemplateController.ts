import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Drive from "@ioc:Adonis/Core/Drive";
import File from "App/Modules/Files/Models/File";
import User from "App/Modules/Users/Models/User";

export default class TemplateController {
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

    //

    response.send(buffer);
  }
}
