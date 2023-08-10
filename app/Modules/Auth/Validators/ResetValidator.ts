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
    password: schema.string({ trim: true }, [rules.confirmed()]),
  });

  public messages = { ...commonMessages };
}
