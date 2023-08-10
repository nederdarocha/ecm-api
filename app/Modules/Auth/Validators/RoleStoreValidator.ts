import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export const shape = {
  permission_ids: schema.array().members(schema.string()),
};

export class RoleStoreValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    ...shape,
    name: schema.string({ trim: true }, [rules.unique({ table: "roles", column: "name" })]),
    slug: schema.string({ trim: true }, [rules.unique({ table: "roles", column: "slug" })]),
  });

  public messages = { ...commonMessages };
}
