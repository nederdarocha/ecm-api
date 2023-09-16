import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class CustomerOrderServiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    honorary_type: schema.string({ trim: true }),
    honorary_value: schema.number.optional(),
    service_amount: schema.number.nullableAndOptional(),
  });

  public messages = { ...commonMessages };
}
