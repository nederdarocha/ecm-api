import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class MadePaymentValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    notes: schema.string.optional({ trim: true }),
    paid_date: schema.date({ format: "yyyy-MM-dd" }),
    paid_cents_value: schema.number(),
    file: schema.file.optional({
      size: "10mb",
      extnames: ["jpg", "jpeg", "png", "pdf"],
    }),
  });

  public messages = {
    ...commonMessages,
    "file.size": "A imagem não pode ser maior que 10MB",
    "file.extnames": "O arquivo não possui uma extensão permitida",
  };
}
