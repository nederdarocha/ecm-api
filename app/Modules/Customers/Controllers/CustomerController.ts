import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Customer from "../Models/Customer";
import { CustomerValidator, CustomerIndexValidator } from "../Validators";
import { CustomerService } from "../Services/CustomerService";

export default class CustomerController {
  private service: CustomerService;

  constructor() {
    this.service = new CustomerService();
  }

  public async index({ paginate, request, auth }: HttpContextContract) {
    await request.validate(CustomerIndexValidator);
    const { page, per_page } = paginate;
    const { filter } = request.qs();

    const users = await Customer.query()
      // .debug(true)
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq
          .orWhereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
          .orWhere("email", "iLike", `%${filter}%`)
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
          .orWhere("phone", "iLike", `%${filter}%`)
      )
      .orderBy("name", "asc")
      .paginate(page, per_page);

    return users.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { roles: { fields: { omit: ["id"] } } },
    });
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { ...data } = await request.validate(CustomerValidator);
    const { tenant_id } = auth.user!;

    const isSigleCustomer = await this.service.isSigleCustomer({ auth, request });
    if (isSigleCustomer instanceof Error) {
      return response.badRequest({ message: isSigleCustomer.message });
    }

    const customer = await Customer.create({
      ...data,
      tenant_id,
      user_id: auth.user!.id,
    });

    return customer.serialize({
      fields: {
        omit: ["tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const customer = await Customer.query().where("id", params.id).firstOrFail();

    await bouncer.with("CustomerPolicy").authorize("tenant", customer);

    return customer;
  }

  public async update({ auth, request, response, params, bouncer }: HttpContextContract) {
    const { ...data } = await request.validate(CustomerValidator);
    const customer = await Customer.findOrFail(params.id);

    //policy
    await bouncer.with("CustomerPolicy").authorize("tenant", customer);

    const isSigleCustomer = await this.service.isSigleCustomer({ auth, request, id: params.id });
    if (isSigleCustomer instanceof Error) {
      return response.badRequest({ message: isSigleCustomer.message });
    }

    await customer.merge(data).save();

    return customer;
  }
}
