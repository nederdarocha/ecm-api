import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Customer from "../Models/Customer";
import { CustomerValidator } from "../Validators";

interface IsSigleUserProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class CustomerService {
  public async isSigleCustomer({ auth, request, id }: IsSigleUserProps): Promise<Error | void> {
    const { email, document, document_secondary, phone } = await request.validate(
      CustomerValidator
    );

    const existDocument = Customer.query()
      .select("id")
      .where("document", document)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existDocument.andWhereNot("id", id);

    if (await existDocument.first()) {
      return new Error("o CPF informado já está em uso");
    }

    if (document_secondary) {
      const existDocumentSecondary = Customer.query()
        .select("id")
        .where("document_secondary", document_secondary)
        .andWhere("tenant_id", auth.user!.tenant_id);
      if (id) existDocumentSecondary.andWhereNot("id", id);

      if (await existDocumentSecondary.first()) {
        return new Error("o documento informado já está em uso");
      }
    }

    const existEmail = Customer.query()
      .select("id")
      .where("email", email)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existEmail.andWhereNot("id", id);

    if (await existEmail.first()) {
      return new Error("o email informado já está em uso");
    }

    const existPhone = Customer.query()
      .select("id")
      .where("phone", phone)
      .andWhere("tenant_id", auth.user!.tenant_id);
    if (id) existPhone.andWhereNot("id", id);

    if (await existPhone.first()) {
      return new Error("o celular informado já está em uso");
    }
  }

  public async findById(id: string): Promise<Partial<Customer> | null> {
    const user = await Customer.findOrFail(id);
    return user.serialize({
      fields: {
        omit: ["tenant_id", "created_at", "updated_at"],
      },
    });
  }
}
