import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { EXTNAMES } from "./FileStoreValidator";

export class FileUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [
      rules.maxLength(100),
      rules.regex(/^[^\\/|<>*":?]+$/),
      rules.regex(new RegExp(`^.+\\.(${EXTNAMES.join("|")})$`, "i")),
    ]),
  });

  public messages = {
    "name.regex": `Informe um nome válido para o arquivo. O nome do arquivo não pode conter os caracteres \ / | < > * : "
    e deve possuir uma das seguintes extensões aceitas: ${EXTNAMES.join(", ")}`,
  };
}
