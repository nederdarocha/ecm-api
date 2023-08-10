import { schema, rules } from "@ioc:Adonis/Core/Validator"
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"

export class RefreshValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    refreshToken: schema.string({}, [rules.required()]),
  })

  public messages = {
    "refreshToken.required": "Você precisa informar o refreshToken",
  }
}
