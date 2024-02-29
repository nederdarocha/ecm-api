import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class TaskMadeValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    notes: schema.string.optional({ trim: true }),
    confirmed_at: schema.date({ format: "yyyy-MM-dd" }),
  });

  public messages = { ...commonMessages };
}
