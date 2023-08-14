import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class ForgotValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.required(), rules.email()]),
  });

  public messages = {
    "email.required": "Você precisa informar um e-mail válido",
    "email.email": "Você precisa informar um e-mail válido",
  };
}
