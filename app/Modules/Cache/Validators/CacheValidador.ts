import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class CacheValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    key: schema.string({}),
    value: schema.string({}),
  });

  public messages = { ...commonMessages };
}
