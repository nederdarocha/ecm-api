import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export const shape = {
  name: schema.string({ trim: true }, [rules.required()]),
  role_ids: schema.array().members(schema.string()),
};

export class UserValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    first_name: schema.string.optional({ trim: true }, [rules.required()]),
    customer_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    last_name: schema.string({ trim: true }),
    role_ids: schema.array([rules.nullable()]).members(schema.string()),
    document: schema.string({ trim: true }, [rules.minLength(11), rules.maxLength(11)]),
    email: schema.string({ trim: true }, [rules.email()]),
    phone: schema.string({ trim: true }, [rules.mobile()]),
    status: schema.boolean.optional(),
  });

  public messages = { ...commonMessages };
}
