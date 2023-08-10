import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class PermissionStoreValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.unique({ table: "permissions", column: "name" })]),
    slug: schema.string({ trim: true }, [rules.unique({ table: "permissions", column: "slug" })]),
  });

  public messages = { ...commonMessages };
}
