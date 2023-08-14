import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class ResetValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.request.input("id"),
  });

  public schema = schema.create({
    token: schema.string({ trim: true }, [rules.uuid()]),
    password: schema.string({ trim: true }, [
      rules.confirmed(),
      rules.minLength(8),
      rules.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/),
    ]),
  });

  public messages = {
    ...commonMessages,
    "password.confirmed": "As senhas não conferem",
    "password.minLength": "A senha deve conter pelo menos 8 caracteres",
    "password.regex":
      "A senha deve conter pelo menos 8 caracteres, combinando letras maiúsculas, minúsculas, números e símbolos",
  };
}
