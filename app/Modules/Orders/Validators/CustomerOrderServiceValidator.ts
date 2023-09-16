import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class CustomerOrderServiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    mask: schema.string.optional({ trim: true }),
    honorary: schema.string.optional({ trim: true }),
    service_amount: schema.string.optional({ trim: true }),
  });

  public messages = { ...commonMessages };
}
