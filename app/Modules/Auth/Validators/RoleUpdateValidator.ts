import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { shape } from "./RoleStoreValidator";
import { commonMessages } from "../../../Common";

export default class RoleUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id,
  });

  public schema = schema.create({
    ...shape,
    name: schema.string({ trim: true }, [
      rules.unique({
        table: "roles",
        column: "name",
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
    slug: schema.string({ trim: true }, [
      rules.unique({
        table: "roles",
        column: "slug",
        caseInsensitive: true,
        whereNot: {
          id: this.refs.id,
        },
      }),
    ]),
  });

  public messages = { ...commonMessages };
}
