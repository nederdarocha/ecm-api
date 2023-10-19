import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Database from "@ioc:Adonis/Lucid/Database";
import Env from "@ioc:Adonis/Core/Env";
import { DateTime } from "luxon";
import { v4 as uuid } from "uuid";
import { BadRequest } from "App/Exceptions";

import User from "../../Users/Models/User";

type LoginData = {
  token: string;
  refreshToken: string;
  expires_at: DateTime | undefined;
};

interface LoginProps {
  id: string;
  password: string;
  ctx: HttpContextContract;
}

export class AuthService {
  public async login({ id, password, ctx }: LoginProps): Promise<LoginData | Error> {
    const { auth, request } = ctx;
    let user: User;

    console.log("ips", request.ips());
    console.log("hostname", request.hostname());
    console.log("user-agent", request["user-agent"]);
    console.log("request", request.request.rawHeaders.join("; "));

    try {
      user = await this.findUserById(id);
    } catch (error) {
      throw new BadRequest("Usuário e/ou Senha inválidos", 400);
    }

    if (!user.status) {
      throw new BadRequest(
        `Seu acesso está bloqueado. Entre em contato com a equipe de suporte ` +
          `no e-mail ${Env.get("MAIL_FROM")}`,
        400
      );
    }

    try {
      const access_token = uuid();
      const { accessToken, refreshToken, expiresAt } = await auth
        .use("jwt")
        .attempt(user.phone, password, {
          payload: { access_token },
        });

      await this.destroyOldRefreshTokens(user.id, refreshToken);

      user.access_token = access_token;
      await user.save();

      return {
        token: accessToken,
        refreshToken,
        expires_at: expiresAt,
      };
    } catch (error) {
      if (Env.get("NODE_ENV") === "development") console.log({ error });
      throw new BadRequest("Usuário e/ou Senha inválidos", 400);
    }
  }

  private async findUserById(id: string): Promise<User> {
    const user = await User.query().where("id", id).preload("roles").preload("permissions").first();

    if (!user) {
      throw new BadRequest("email not found", 404);
    }

    return user;
  }

  private async destroyOldRefreshTokens(user_id: string, refreshToken: string): Promise<void> {
    await Database.from("jwt_tokens")
      .where("user_id", user_id)
      .andWhereNot("token", refreshToken)
      .delete();
  }
}
