import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class PaymentValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    order_id: schema.string({ trim: true }, [rules.uuid()]),
    customer_order_service_id: schema.string({ trim: true }, [rules.uuid()]),
    customer_id: schema.string({ trim: true }, [rules.uuid()]),
    description: schema.string.optional({ trim: true }),
    notes: schema.string.optional({ trim: true }),
    due_date: schema.date({ format: "yyyy-MM-dd" }),
    paid_date: schema.date.optional({ format: "yyyy-MM-dd" }),
  });

  public messages = { ...commonMessages };
}
