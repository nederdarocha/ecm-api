import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";

interface JWTPayload {
  data: { userId: string };
}

export default class AuthByUrl {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const { request, response } = ctx;

    if (request.method() === "GET") {
      try {
        const { token } = request.qs();
        const { data } = jwt_decode<JWTPayload>(token);
        jwt.verify(token, Env.get("JWT_PUBLIC_KEY", "").replace(/\\n/g, "\n"));
        ctx.userID = data.userId;
      } catch (error) {
        return response.json({
          message:
            "Não foi possível acessar o link. Tente recarregar a página para gerar um novo link.",
          error,
        });
      }
    }

    await next();
  }
}
