import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { commonMessages } from "../../../Common";

export class CutValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public refs = schema.refs({
    id: this?.ctx?.params.id || null,
  });

  public schema = schema.create({
    product_id: schema.string({ trim: true }, [rules.uuid()]),
    order: schema.number(),
    name: schema.string({ trim: true }, [
      rules.unique({
        table: "cuts",
        column: "name",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    default: schema.boolean(),
    status: schema.boolean(),
  });

  public messages = { ...commonMessages };
}
