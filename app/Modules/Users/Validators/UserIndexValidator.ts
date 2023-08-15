import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class UserIndexValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    filter: schema.string.optional(),
    page: schema.number(),
    perPage: schema.number(),
  });

  public messages = {};
}
