import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export const shape = {
  name: schema.string({ trim: true }, [rules.required()]),
  role_ids: schema.array().members(schema.string()),
};

export class UserStoreValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.required()]),
    role_ids: schema.array([rules.nullable()]).members(schema.string()),
    redirect_url: schema.string(),
    document: schema.string({ trim: true }, [
      rules.minLength(11),
      rules.maxLength(11),
      rules.unique({ table: "users", column: "document" }),
    ]),
    email: schema.string({ trim: true }, [
      rules.unique({
        table: "users",
        column: "email",
        caseInsensitive: true,
      }),
    ]),
    phone: schema.string({ trim: true }, [
      rules.unique({
        table: "users",
        column: "phone",
      }),
    ]),
  });

  public messages = { ...commonMessages };
}
