import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import User from "../Models/User";
import { UserValidator } from "../Validators";

interface IsSigleUserProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class UserService {
  public async isSigleUser({ auth, request, id }: IsSigleUserProps): Promise<Error | void> {
    const { email, document, phone, customer_id } = await request.validate(UserValidator);

    const existDocument = User.query()
      .select("id")
      .where("document", document)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existDocument.andWhereNot("id", id);

    if (await existDocument.first()) {
      return new Error("o CPF informado já está em uso");
    }

    const existEmail = User.query()
      .select("id")
      .where("email", email)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existEmail.andWhereNot("id", id);

    if (await existEmail.first()) {
      return new Error("o E-mail informado já está em uso");
    }

    const existPhone = User.query()
      .select("id")
      .where("phone", phone)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existPhone.andWhereNot("id", id);

    if (await existPhone.first()) {
      return new Error("o Celular informado já está em uso");
    }

    if (!customer_id) {
      return;
    }
    const existCustomer = User.query()
      .select("id")
      .where("customer_id", customer_id)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existPhone.andWhereNot("id", id);

    if (await existCustomer.first()) {
      return new Error("o Cliente informado já está em uso");
    }
  }

  public async findById(id: string): Promise<Partial<User> | null> {
    const user = await User.query().preload("roles").where("id", id).firstOrFail();
    return user.serialize({
      fields: {
        omit: ["user_id", "created_at", "updated_at"],
      },
      relations: {
        roles: {
          fields: {
            pick: ["id", "name"],
          },
        },
      },
    });
  }
}
