import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { shape } from "./UserStoreValidator";
import { commonMessages } from "../../../Common";

export default class UserUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id,
  });

  public schema = schema.create({
    ...shape,
    document: schema.string({ trim: true }, [
      rules.minLength(11),
      rules.maxLength(11),
      rules.unique({
        table: "users",
        column: "document",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    email: schema.string({ trim: true }, [
      rules.unique({
        table: "users",
        column: "email",
        caseInsensitive: true,
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    phone: schema.string({ trim: true }, [
      rules.unique({
        table: "users",
        column: "phone",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    role_ids: schema.array([rules.nullable()]).members(schema.string()),
    status: schema.boolean(),
  });

  public messages = { ...commonMessages };
}
