import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { commonMessages } from "../../../Common";

export class PortionValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public refs = schema.refs({
    id: this?.ctx?.params.id || null,
  });

  public schema = schema.create({
    product_id: schema.string({ trim: true }, [rules.uuid()]),
    order: schema.number(),
    name: schema.string({ trim: true }, [
      rules.unique({
        table: "portions",
        column: "name",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    price_cents: schema.number.nullable(),
    default: schema.boolean(),
    status: schema.boolean(),
  });

  public messages = { ...commonMessages };
}
