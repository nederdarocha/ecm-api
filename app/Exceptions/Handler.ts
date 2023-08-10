import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Logger from "@ioc:Adonis/Core/Logger";
import HttpExceptionHandler from "@ioc:Adonis/Core/HttpExceptionHandler";
import { Exception } from "@adonisjs/core/build/standalone";

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger);
  }

  public async handle(error: Exception, ctx: HttpContextContract) {
    switch (error.code) {
      case "ERR_JWS_INVALID":
        return ctx.response.status(400).send({
          code: "ERR_JWS_INVALID",
          message: "Token inválido",
          status: 401,
        });

      case "E_UNAUTHORIZED_ACCESS":
        return ctx.response.status(401).send({
          code: "ERR_JWS_INVALID",
          message: "Token inválido",
          status: 401,
        });

      default:
        return super.handle(error, ctx);
    }
  }
}
