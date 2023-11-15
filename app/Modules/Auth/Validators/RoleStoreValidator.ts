import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { commonMessages } from "../../../Common";

export class RoleStoreValidator {
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.unique({ table: "roles", column: "name" })]),
    slug: schema.string({ trim: true }, [rules.unique({ table: "roles", column: "slug" })]),
  });

  public messages = { ...commonMessages };
}
