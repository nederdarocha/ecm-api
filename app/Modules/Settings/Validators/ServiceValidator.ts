import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class SettingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    spa_version: schema.string.optional({ trim: true }),
    fl_maintenance: schema.boolean.optional(),
  });

  public messages = { ...commonMessages };
}
