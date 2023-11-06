import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";

export const EXTNAMES = [
  "doc",
  "xls",
  "csv",
  "txt",
  "docx",
  "xlsx",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "bmp",
  "zip",
];

export class FileStoreValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    owner_id: schema.string({}, [rules.uuid()]),
    folder_name: schema.string({ trim: true }),
    file: schema.file({
      size: Env.get("MAX_UPLOAD_FILE_SIZE", "10mb"),
      extnames: EXTNAMES,
    }),
  });

  public messages = {
    "file.size": "o arquivo não pode ser maior que 5mb",
    "file.extnames": `O arquivo não possui uma extensão permitida. Extensões permitidas:
    ${EXTNAMES.join(", ")}.`,
  };
}
