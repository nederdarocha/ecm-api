import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class ServiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    description: schema.string.optional({ trim: true }),
    price: schema.number.optional(),
    number: schema.number.optional(),
    out_court: schema.boolean.optional(),
    status: schema.boolean.optional(),
  });

  public messages = { ...commonMessages };
}
