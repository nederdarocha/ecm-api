import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class ItemValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id || null,
    order_id: this.ctx.request.input("order_id"),
  });

  public schema = schema.create({
    order_id: schema.string({}, [rules.uuid()]),
    customer_id: schema.string({}, [rules.uuid()]),
    product_id: schema.string({}, [rules.uuid()]),
    packing_id: schema.string({}, [rules.uuid()]),
    cut_id: schema.string({}, [rules.uuid()]),
    portion_id: schema.string({}, [rules.uuid()]),
    quantity: schema.number(),
    measured: schema.string({ trim: true }),
    price_cents: schema.number(),
    price_cents_discount: schema.number.nullable(),
    price_cents_packing: schema.number.nullable(),
    amount_cents: schema.number(),
    description: schema.string.optional({ trim: true }),
  });

  public messages = { ...commonMessages };
}
