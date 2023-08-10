import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class GroupValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public refs = schema.refs({
    id: this?.ctx?.params.id || null,
  });

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.unique({
        table: "groups",
        column: "name",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),

    slug: schema.string({ trim: true }, [
      rules.unique({
        table: "groups",
        column: "slug",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    order: schema.number.nullable(),
    status: schema.boolean.nullable(),
  });

  public messages = { ...commonMessages };
}
