import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class CaseValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    notes: schema.string.optional({ trim: true }),
    started_at: schema.date.optional({ format: "dd/MM/yyyy" }),
  });

  public messages = { ...commonMessages };
}
