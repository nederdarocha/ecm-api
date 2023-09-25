import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class CustomerIndexValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    filter: schema.string.optional(),
    phone: schema.string.optional(),
    indicated_id: schema.string.optional(),
    page: schema.number(),
    per_page: schema.number(),
  });

  public messages = {};
}
