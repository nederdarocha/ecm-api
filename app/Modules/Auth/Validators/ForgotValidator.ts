import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class ForgotValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.required(), rules.email()]),
    redirect_url: schema.string({}),
  });

  public messages = {
    "email.required": "Você precisa informar um e-mail válido",
    "email.email": "Você precisa informar um e-mail válido",
    "redirect_url.required": "Você precisa informar url de redirect",
    "redirect_url.url": "Você precisa informar uma url válida",
  };
}
