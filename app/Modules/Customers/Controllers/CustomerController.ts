import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Customer from "../Models/Customer";
import { CustomerValidator, CustomerIndexValidator } from "../Validators";

export default class CustomerController {
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

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(CustomerValidator);
    const { tenant_id } = auth.user!;

    //TODO validar unicidades considerando o tenant

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

  public async update({ request, params, bouncer }: HttpContextContract) {
    const { ...data } = await request.validate(CustomerValidator);
    const customer = await Customer.findOrFail(params.id);

    //policy
    await bouncer.with("CustomerPolicy").authorize("tenant", customer);

    //TODO validar unicidades considerando o tenant

    await customer.merge(data).save();

    return customer;
  }
}
