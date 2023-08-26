import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export default class PermissionStoreRelatedRoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    role_id: schema.string({}, [rules.uuid()]),
    name: schema.string({ trim: true }),
    initials: schema.string({ trim: true }),
    slug: schema.string({ trim: true }),
    c: schema.boolean(),
    r: schema.boolean(),
    u: schema.boolean(),
    d: schema.boolean(),
  });

  public messages = { ...commonMessages };
}
