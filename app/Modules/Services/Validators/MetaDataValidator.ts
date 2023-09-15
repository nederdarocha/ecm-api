import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class MetaDataValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    data: schema.array().members(
      schema.object().members({
        meta_data_id: schema.string(),
        value: schema.string(),
      })
    ),
  });

  public messages = { ...commonMessages };
}
