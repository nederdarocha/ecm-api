import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Customer from "../Models/Customer";
import { CustomerValidator } from "../Validators";
import User from "App/Modules/Users/Models/User";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Role from "App/Modules/Auth/Models/Role";
import { capitalize, titleize } from "inflection";

interface IsSigleUserProps {
  auth: AuthContract;
  request: RequestContract;
  id?: string;
}

export class CustomerService {
  public async isSigleCustomer({ auth, request, id }: IsSigleUserProps): Promise<Error | void> {
    const { document, document_secondary } = await request.validate(CustomerValidator);

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

    // const existEmail = Customer.query()
    //   .select("id")
    //   .where("email", email)
    //   .andWhere("tenant_id", auth.user!.tenant_id);
    // if (id) existEmail.andWhereNot("id", id);

    // if (await existEmail.first()) {
    //   return new Error("o email informado já está em uso");
    // }

    // const existPhone = Customer.query()
    //   .select("id")
    //   .where("phone", phone)
    //   .andWhere("tenant_id", auth.user!.tenant_id);
    // if (id) existPhone.andWhereNot("id", id);

    // if (await existPhone.first()) {
    //   return new Error("o celular informado já está em uso");
    // }
  }

  public async findById(id: string): Promise<Partial<Customer> | null> {
    const user = await Customer.findOrFail(id);
    return user.serialize({
      fields: {
        omit: ["tenant_id", "created_at", "updated_at"],
      },
    });
  }

  private findUserByCustomerId(auth: AuthContract, customer_id: string): Promise<User | null> {
    return User.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_id", customer_id)
      .first();
  }

  private findUserByCustomerDocument(auth: AuthContract, document: string): Promise<User | null> {
    return User.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("document", document)
      .first();
  }

  public async createUser(auth: AuthContract, customer_id: string): Promise<User | Error> {
    const customer = await Customer.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", customer_id)
      .first();

    if (!customer) {
      return new Error("Cliente não encontrado");
    }

    if (!customer.email) {
      return new Error("Cliente não possui e-mail cadastrado");
    }

    if (!customer.phone) {
      return new Error("Cliente não possui celular cadastrado");
    }

    let user = await this.findUserByCustomerId(auth, customer_id);
    if (user) {
      return user;
    }

    user = await this.findUserByCustomerDocument(auth, customer?.document!);
    if (user) {
      await user.merge({ customer_id }).save();
      return user;
    }

    try {
      const first_name = customer.name.split(" ")[0] || "";
      const [_, ...rest_name] = customer.name.split(" ") || "";
      const last_name = rest_name.join(" ");
      const roleCustomer = await Role.findByOrFail("slug", "cust");
      const salt = await bcrypt.genSalt(10);

      user = await User.create({
        customer_id,
        first_name: capitalize(first_name),
        last_name: titleize(last_name),
        document: customer.document,
        email: customer?.email!,
        tenant_id: auth.user!.tenant_id,
        phone: customer.phone,
        password: crypto.randomBytes(16).toString("hex"),
        status: true,
        user_id: auth.user!.id,
        salt,
      });
      await user.related("roles").attach([roleCustomer.id]);

      return user;
    } catch (error) {
      return new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  public async updateUser(auth: AuthContract, customer_id: string): Promise<User | Error> {
    const customer = await Customer.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", customer_id)
      .first();

    if (!customer) {
      return new Error("Cliente não encontrado");
    }

    if (!customer.email) {
      return new Error("Cliente não possui e-mail cadastrado");
    }

    if (!customer.phone) {
      return new Error("Cliente não possui celular cadastrado");
    }

    const user = await this.findUserByCustomerDocument(auth, customer?.document!);
    if (user) {
      await user.merge({ customer_id }).save();
    }

    if (!user) {
      return new Error("Usuário não encontrado");
    }

    try {
      const first_name = customer.name.split(" ")[0] || "";
      const [_, ...rest_name] = customer.name.split(" ") || "";
      const last_name = rest_name.join(" ");
      const roleCustomer = await Role.findByOrFail("slug", "cust");

      user.merge({
        customer_id,
        first_name: capitalize(first_name),
        last_name: titleize(last_name),
        document: customer.document,
        email: customer?.email!,
        phone: customer.phone,
        status: true,
        user_id: auth.user!.id,
      });

      await user.related("roles").attach([roleCustomer.id]);

      return user.save();
    } catch (error) {
      return new Error(`Erro ao editar usuário: ${error.message}`);
    }
  }
}
