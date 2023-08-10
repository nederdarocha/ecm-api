import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    user: schema.string({ trim: true }, [rules.required()]),
    password: schema.string({ trim: true }, [rules.required()]),
  });

  public messages = {
    "user.required": "Você precisa informar o telefone",
    "password.required": "Você precisa informar a senha",
  };
}
