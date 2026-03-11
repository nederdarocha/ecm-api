import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class TypeTaskValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    category_id: schema.string({ trim: true }, [rules.uuid()]),
    type: schema.string({ trim: true }),
  });

  public messages = { ...commonMessages };
}
