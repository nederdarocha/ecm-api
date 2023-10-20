import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export const shape = {
  name: schema.string({ trim: true }, [rules.required()]),
  role_ids: schema.array().members(schema.string()),
};

export class CourtValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    initials: schema.string({ trim: true }, [rules.required()]),
    district: schema.string({ trim: true }, [rules.required()]),
  });

  public messages = { ...commonMessages };
}
