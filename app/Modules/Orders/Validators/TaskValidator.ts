import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class TaskValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    order_id: schema.string({ trim: true }, [rules.uuid()]),
    notes: schema.string({ trim: true }),
    made_at: schema.date({ format: "yyyy-MM-dd" }),
    make_in: schema.date.optional({ format: "yyyy-MM-dd" }),
    confirmed_by: schema.string.optional({ trim: true }, [rules.uuid()]),
    status: schema.string.optional({ trim: true }),
  });

  public messages = { ...commonMessages };
}
