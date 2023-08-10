import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";
import jwt from "jsonwebtoken";

export default class AuthByUrl {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const { token } = request.qs();

    try {
      jwt.verify(token, Env.get("JWT_PUBLIC_KEY", "").replace(/\\n/g, "\n"));
    } catch (error) {
      return response.json({
        message:
          "Não foi possível acessar o link. Tente recarregar a página para gerar um novo link.",
        error,
      });
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next();
  }
}
