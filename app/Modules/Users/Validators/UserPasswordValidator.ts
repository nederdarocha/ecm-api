import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export default class UserPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.request.input("id"),
  });

  public schema = schema.create({
    password: schema.string({ trim: true }, [rules.required()]),
    new_password: schema.string({ trim: true }, [
      rules.confirmed(),
      rules.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/),
    ]),
  });

  public messages = {
    ...commonMessages,

    "password.regex":
      "A senha deve conter pelo menos 8 caracteres, combinando letras maiúsculas, minúsculas, números e símbolos",
  };
}
