import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export const shape = {
  name: schema.string({ trim: true }, [rules.required()]),
  role_ids: schema.array().members(schema.string()),
};

export class CustomerValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.required()]),
    document: schema.string({ trim: true }, [rules.minLength(11), rules.maxLength(14)]),
    email: schema.string({ trim: true }, [rules.email()]),
    phone: schema.string({ trim: true }),
    document_secondary: schema.string.nullableAndOptional({ trim: true }),
    issuing_agency: schema.string.nullableAndOptional({ trim: true }),
    is_indicator: schema.boolean(),
    commission: schema.number.nullableAndOptional(),
    previdencia_id: schema.string.nullableAndOptional({ trim: true }),
    previdencia_password: schema.string.nullableAndOptional({ trim: true }),
    proderj_id: schema.string.nullableAndOptional({ trim: true }),
    proderj_password: schema.string.nullableAndOptional({ trim: true }),
    birth_date: schema.date.nullableAndOptional({ format: "yyyy-MM-dd" }),
    profession: schema.string.nullableAndOptional({ trim: true }),
    natural: schema.boolean(),
    gender: schema.string.nullableAndOptional({ trim: true }),
    bank: schema.string.nullableAndOptional({ trim: true }),
    branch: schema.string.nullableAndOptional({ trim: true }),
    account_number: schema.string.nullableAndOptional({ trim: true }),
    pix_key: schema.string.nullableAndOptional({ trim: true }),
    notes: schema.string.nullableAndOptional(),
    indicated_id: schema.string.nullableAndOptional({ trim: true }, [rules.uuid()]),
  });

  public messages = { ...commonMessages };
}
