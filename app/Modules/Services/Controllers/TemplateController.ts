import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Drive from "@ioc:Adonis/Core/Drive";
import File from "App/Modules/Files/Models/File";
import User from "App/Modules/Users/Models/User";
import { TemplateService } from "../Services/TemplateService";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import slugify from "slugify";

export default class TemplateController {
  private service: TemplateService;

  constructor() {
    this.service = new TemplateService();
  }

  public async getTemplatesByServiceId({ auth, params: { service_id } }: HttpContextContract) {
    const data = await File.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", service_id)
      .orderBy("name", "asc");

    return data.map((item) => item.serialize({ fields: { omit: ["tenant_id", "user_id"] } }));
  }

  public async download({
    userID,
    response,
    params: { id, customer_id, order_service_id },
  }: HttpContextContract) {
    const user = await User.findOrFail(userID);

    console.log({ id, customer_id, order_service_id });

    const file = await File.query()
      .where("tenant_id", user.tenant_id)
      .where("id", id)
      .firstOrFail();

    // check customer address
    const checkAddress = await this.service.checkAddress(customer_id);
    if (checkAddress instanceof Error) {
      return "<h3>Para gerar o documento é preciso cadastrar um endereço para o cliente.</h3>";
    }

    const data = await this.service.getData({ customer_id, order_service_id });
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

    doc.render({ ...data });

    const bufferRender = doc.getZip().generate({
      type: "nodebuffer",
      // compression: "DEFLATE",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    response.send(bufferRender);
  }
}
