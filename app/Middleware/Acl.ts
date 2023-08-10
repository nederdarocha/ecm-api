import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { getUserAcl } from "../Common/utils";
import { intersection } from "lodash";

export default class Acl {
  public async handle(
    { auth: { user }, response }: HttpContextContract,
    next: () => Promise<void>,
    middlewareParams: string[]
  ) {
    if (!user) {
      return response.unauthorized();
    }

    const slug = await getUserAcl(user.id);
    const middlewareParamsWithAdmin = [...middlewareParams, "admin"];

    if (intersection(slug, middlewareParamsWithAdmin).length < 1) {
      return response.forbidden("Você não possui privilégio para acessar este recurso");
    }

    await next();
  }
}
