import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class MetaDataValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    service_id: schema.string({ trim: true }, [rules.uuid()]),
    label: schema.string({ trim: true }),
    name: schema.string({ trim: true }),
    type: schema.string({ trim: true }),
    options: schema.string.optional({ trim: true }),
    decimal_places: schema.number.optional(),
    style: schema.string({ trim: true }),
    status: schema.boolean.optional(),
  });

  public messages = { ...commonMessages };
}
