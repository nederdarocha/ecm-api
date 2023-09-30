import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { StatusValidator } from "../Validators";
import Status from "../Models/Status";

interface IsSigleProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class StatusService {
  public async isSigle({ auth, request, id }: IsSigleProps): Promise<Error | void> {
    const { name } = await request.validate(StatusValidator);

    const existInitials = Status.query()
      .select("id")
      .where("name", name)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existInitials.andWhereNot("id", id);

    if (await existInitials.first()) {
      return new Error("o Sigla informada já está em uso");
    }
  }

  public async findById(): Promise<null> {
    return null;
  }
}
