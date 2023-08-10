import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class OrderValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public refs = schema.refs({
    id: this?.ctx?.params.id! || null,
  });

  public schema = schema.create({
    customer_id: schema.string({}, [rules.uuid()]),
    description: schema.string.optional({ trim: true }),
  });

  public messages = { ...commonMessages };
}
