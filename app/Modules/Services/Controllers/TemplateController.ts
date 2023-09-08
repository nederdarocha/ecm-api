import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Drive from "@ioc:Adonis/Core/Drive";
import File from "App/Modules/Files/Models/File";
import User from "App/Modules/Users/Models/User";

import * as fs from "fs";
import { resolve } from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

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

    const zip = new PizZip(buffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      first_name: "John",
      last_name: "Doe",
      phone: "0652455478",
      description: "New Website",
    });

    const blob = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const buf = await doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.writeFileSync(resolve(__dirname, "output.docx"), buf);

    response.send(blob);
  }
}
