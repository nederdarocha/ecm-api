import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Service from "../Models/Service";
import { ServiceValidator } from "../Validators";

interface IsExiteNameCategoryProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class ServiceService {
  public async isExiteNameCategory({
    auth,
    request,
    id,
  }: IsExiteNameCategoryProps): Promise<Error | void> {
    const { name } = await request.validate(ServiceValidator);

    const existName = Service.query()
      .select("id")
      .where("name", name)
      .andWhere("tenant_id", auth.user!.tenant_id);

    if (id) existName.andWhereNot("id", id);

    if (await existName.first()) {
      return new Error("o Nome informado já está em uso");
    }
  }
}
