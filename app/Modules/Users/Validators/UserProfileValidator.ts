import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export default class UserProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.request.input("id"),
  });

  public schema = schema.create({
    first_name: schema.string({ trim: true }, [rules.required()]),
    last_name: schema.string({ trim: true }),
    gender: schema.string({ trim: true }),
    birthday: schema.date({ format: "yyyy-MM-dd" }),

    phone: schema.string({ trim: true }, [
      rules.unique({
        table: "users",
        column: "phone",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
  });

  public messages = { ...commonMessages };
}
