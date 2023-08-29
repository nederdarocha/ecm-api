import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";

import { commonMessages } from "../../../Common";

export const EXTNAMES = ["doc", "docx"];

export class TemplateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    service_id: schema.string({}, [rules.uuid()]),
    name: schema.string({ trim: true }),
    description: schema.string.optional({ trim: true }),
    file: schema.file({
      size: Env.get("MAX_UPLOAD_FILE_SIZE", "10mb"),
      extnames: EXTNAMES,
    }),
  });

  public messages = {
    ...commonMessages,
    "file.size": "o arquivo não pode ser maior que 5mb",
    "file.extnames": `O arquivo não possui uma extensão permitida. Extensões permitidas:
  ${EXTNAMES.join(", ")}.`,
  };
}
