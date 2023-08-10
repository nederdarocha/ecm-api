import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class SignInValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    phone: schema.string({ trim: true }, [rules.required()]),
  });

  public messages = {
    "phone.required": "Você precisa informar o número do telefone",
  };
}
