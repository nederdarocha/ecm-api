import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { CourtValidator } from "../Validators";
import Court from "../Models/Courts";

interface IsSigleProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class CourtService {
  public async isSigle({ auth, request, id }: IsSigleProps): Promise<Error | void> {
    const { initials } = await request.validate(CourtValidator);

    const existInitials = Court.query()
      .select("id")
      .where("initials", initials)
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
