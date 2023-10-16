import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class MadePaymentValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    notes: schema.string.optional({ trim: true }),
    paid_date: schema.date({ format: "yyyy-MM-dd" }),
    paid_cents_value: schema.number(),
  });

  public messages = { ...commonMessages };
}
