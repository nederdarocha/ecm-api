import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class OrderServiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    honorary_type: schema.string({ trim: true }),
    honorary_cents_value: schema.number.optional(),
    service_cents_amount: schema.number.nullableAndOptional(),
    defendant: schema.string.nullableAndOptional(),
    court_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    court_number: schema.string.optional({ trim: true }),
  });

  public messages = { ...commonMessages };
}
