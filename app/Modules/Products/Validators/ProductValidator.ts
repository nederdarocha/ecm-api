import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { commonMessages } from "../../../Common";

export class ProductValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public refs = schema.refs({
    id: this?.ctx?.params.id || null,
  });

  public schema = schema.create({
    group_id: schema.string({ trim: true }, [rules.uuid()]),
    order: schema.number(),
    name: schema.string({ trim: true }, [
      rules.unique({
        table: "products",
        column: "name",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    slug: schema.string({ trim: true }, [
      rules.unique({
        table: "products",
        column: "slug",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    description: schema.string.optional({ trim: true }),
    measured: schema.string({ trim: true }),
    price_cents: schema.number(),
    price_cents_discount: schema.number.nullable(),
    quantity_min: schema.number(),
    increase: schema.number(),
    quantity_max: schema.number(),
    highlight: schema.boolean(),
    available: schema.boolean(),
    status: schema.boolean(),
  });

  public messages = { ...commonMessages };
}
