import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import TemplateMessage from "../Models/TemplateMessage";
import { TemplateMessageValidator } from "../Validators";

interface IsExiteNameCategoryProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class TemplateMessageService {
  public async isExiteName({
    auth,
    request,
    id,
  }: IsExiteNameCategoryProps): Promise<Error | void> {
    const { name } = await request.validate(TemplateMessageValidator);

    const existName = TemplateMessage.query()
      .select("id")
      .where("name", name)
      .andWhere("tenant_id", auth.user!.tenant_id);

    if (id) existName.andWhereNot("id", id);

    if (await existName.first()) {
      return new Error("o Nome informado já está em uso");
    }
  }
}
