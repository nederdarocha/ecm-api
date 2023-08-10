import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export default class PermissionUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id,
  });

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({
        table: "permissions",
        column: "name",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    slug: schema.string({ trim: true }, [
      rules.unique({
        table: "permissions",
        column: "slug",
        caseInsensitive: true,
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
  });

  public messages = { ...commonMessages };
}
