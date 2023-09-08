import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Drive from "@ioc:Adonis/Core/Drive";
import File from "App/Modules/Files/Models/File";
import User from "App/Modules/Users/Models/User";
import { TemplateService } from "../Services/TemplateService";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import slugify from "slugify";

export default class TemplateController {
  private service;

  constructor() {
    this.service = new TemplateService();
  }

  public async download({
    userID,
    response,
    params: { case_customer_service_id, id },
  }: HttpContextContract) {
    const user = await User.findOrFail(userID);
    const file = await File.query()
      .where("tenant_id", user.tenant_id)
      .where("id", id)
      .firstOrFail();

    const data = await this.service.getData(case_customer_service_id);
    const file_name = slugify(file.name.replace(/\.|docx|-/gi, " ") + "_" + data.cliente_nome, "_");

    response.attachment(file_name + "." + file.type);
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

    // doc.render({
    //   name: data.name,
    //   document: data.document,
    //   phone: data.phone,
    // });

    doc.render(data);

    const bufferRender = doc.getZip().generate({
      type: "nodebuffer",
      // compression: "DEFLATE",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    response.send(bufferRender);
  }
}
