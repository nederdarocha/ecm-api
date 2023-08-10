import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import { v4 as uuid } from "uuid";

import User from "../../Users/Models/User";
import {
  SignInValidator,
  ForgotValidator,
  RefreshValidator,
  LogoutValidator,
  LoginValidator,
  ResetValidator,
} from "../Validators";
import { AuthService } from "../Services/AuthService";

import UserToken from "App/Modules/Users/Models/UserToken";
import { BadRequest } from "App/Exceptions";

export default class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  public async signIn({ request, response }: HttpContextContract) {
    const { phone } = await request.validate(SignInValidator);
    try {
      await User.findByOrFail("phone", phone);
      return response.status(200);
    } catch (_) {
      return response.status(204);
    }
  }

  public async login({ auth, request }: HttpContextContract) {
    const { user, password } = await request.validate(LoginValidator);
    try {
      const { id, salt } = await User.query()
        .select("id", "salt")
        .where("email", user)
        .orWhere("phone", user)
        .firstOrFail();

      return this.service.login(id, `${password}${salt}`, auth);
    } catch (error) {
      if (Env.get("NODE_ENV") === "development") {
        console.log("#ERROR ao encontrar o usuário =>", error);
      }
      throw new BadRequest("Usuário e/ou Senha inválidos", 400);
    }
  }

  public async forgot({ request, response }: HttpContextContract) {
    const { email, redirect_url } = await request.validate(ForgotValidator);
    const message = `Se você forneceu um e-mail cadastrado em breve receberá um e-mail com o link para você criar uma nova senha.`;

    try {
      const user = await User.findByOrFail("email", email);
      const token = uuid();
      user.related("tokens").create({ token, type: "forgot" });

      // TODO  verificar o tempo do último link enviado para evitar span

      Mail.send((message) => {
        message
          .from(Env.get("MAIL_FROM"), Env.get("MAIL_NAME"))
          .to(email)
          .subject(`${Env.get("MAIL_SUBJECT")} - Criar nova senha`)
          .htmlView("emails/forgot", {
            name: user.name,
            url: `${redirect_url}/${token}`,
          });
      });

      return response.status(200).send({ message });
    } catch (error) {
      if (Env.get("NODE_ENV") === "development") {
        console.log("#ERROR ao encontrar o usuário =>", error);
      }

      return response.status(200).send({ message });
    }
  }

  public async reset({ request, response }: HttpContextContract) {
    const { token, password } = await request.validate(ResetValidator);

    try {
      const userToken = await UserToken.query().preload("user").where("token", token).firstOrFail();
      const { user } = userToken;
      // TODO verificar o tempo de expiração do token
      user.password = password;
      await user.save();
      await userToken.delete();

      return response.ok({ message: "senha alterada com sucesso." });
    } catch (error) {
      return response.badRequest({ message: "Link inválido ou expirado" });
    }
  }

  public async refresh({ request, auth }: HttpContextContract) {
    const { refreshToken: refresh_token } = await request.validate(RefreshValidator);
    const user = auth.user;

    const { accessToken, refreshToken, expiresAt } = await auth
      .use("jwt")
      .loginViaRefreshToken(refresh_token, {
        payload: {
          email: user?.email,
          access_token: user?.access_token,
        },
      });

    return { token: accessToken, refreshToken, expires_at: expiresAt };
  }

  public async logout({ auth, request }: HttpContextContract) {
    const { refreshToken } = await request.validate(LogoutValidator);

    await auth.use("jwt").revoke({
      refreshToken,
    });

    return {
      revoked: true,
    };
  }
}
