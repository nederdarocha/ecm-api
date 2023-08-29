import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Template from "../Models/Template";
import { TemplateValidator, TemplateUpdateValidator } from "../Validators";

interface IsExiteNameProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class TemplateService {
  public async isExiteNameTemplate({ auth, request, id }: IsExiteNameProps): Promise<Error | void> {
    const { name } = id
      ? await request.validate(TemplateUpdateValidator)
      : await request.validate(TemplateValidator);

    const existName = Template.query()
      .select("id")
      .where("name", name)
      .andWhere("tenant_id", auth.user!.tenant_id);

    if (id) existName.andWhereNot("id", id);

    if (await existName.first()) {
      return new Error("o Nome informado já está em uso");
    }
  }
}
