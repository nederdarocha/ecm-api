import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class CustomerValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id || null,
    owner_id: this.ctx.request.input("owner_id"),
  });

  public schema = schema.create({
    name: schema.string({ trim: true }),
    owner_id: schema.string({}, [rules.uuid()]),
    favorite: schema.boolean.optional(),
    zip: schema.string.optional({ trim: true }),
    street: schema.string.optional({ trim: true }),
    number: schema.string.optional({ trim: true }),
    complement: schema.string.optional({ trim: true }),
    neighborhood: schema.string.optional({ trim: true }),
    city: schema.string.optional({ trim: true }),
    state: schema.string.optional({ trim: true }),
    country: schema.string.optional({ trim: true }),
    reference: schema.string.optional({ trim: true }),
    latitude: schema.number.optional(),
    longitude: schema.number.optional(),
  });

  public messages = { ...commonMessages };
}
