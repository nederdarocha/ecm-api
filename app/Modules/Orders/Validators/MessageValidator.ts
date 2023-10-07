import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class MessageValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    order_id: schema.string({ trim: true }, [rules.uuid()]),
    message: schema.string({ trim: true }),
    made_at: schema.date({ format: "yyyy-MM-dd" }),
    customer_id: schema.string({ trim: true }, [rules.uuid()]),
    status: schema.string.optional({ trim: true }),
  });

  public messages = { ...commonMessages };
}
