import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class ServiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    category_id: schema.string({ trim: true }, [rules.uuid()]),
    description: schema.string.optional({ trim: true }),
    price: schema.number.optional(),
    number: schema.number.optional(),
    out_court: schema.boolean.optional(),
    status: schema.boolean.optional(),
  });

  public messages = { ...commonMessages };
}
