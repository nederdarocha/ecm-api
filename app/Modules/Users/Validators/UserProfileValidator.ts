import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export default class UserProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.request.input("id"),
  });

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.required()]),
    phone: schema.string({ trim: true }, [rules.mobile({ locale: ["pt-BR"] })]),
  });

  public messages = { ...commonMessages };
}
