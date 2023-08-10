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
    new_password: schema.string({ trim: true }, [rules.confirmed()]),
  });

  public messages = { ...commonMessages };
}
