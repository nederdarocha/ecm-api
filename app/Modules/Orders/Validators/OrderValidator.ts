import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class OrderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    notes: schema.string.optional({ trim: true }),
    status_id: schema.string({ trim: true }, [rules.uuid()]),
    started_at: schema.date.optional({ format: "dd/MM/yyyy" }),
  });

  public messages = { ...commonMessages };
}
