import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export default class PermissionUpdatePartialValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id,
  });

  public schema = schema.create({
    initial: schema.string({ trim: true }),
    checked: schema.boolean(),
  });

  public messages = { ...commonMessages };
}
