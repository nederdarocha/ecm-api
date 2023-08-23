import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

const EXTNAMES = [
  "jpg",
  "jpeg",
  "png",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "txt",
];

export class FileStoreValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    owner_id: schema.string({}, [rules.uuid()]),
    file: schema.file({
      size: "5mb",
      extnames: EXTNAMES,
    }),
  });

  public messages = {
    "file.size": "o arquivo não pode ser maior que 5mb",
    "file.extnames": `O arquivo não possui uma extensão permitida. Extensões permitidas:
    ${EXTNAMES.join(", ")}.`,
  };
}
