import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Customer from "../Models/Customer";
import { CustomerValidator } from "../Validators";
import { CustomerService } from "../Services/CustomerService";
import { schema } from "@ioc:Adonis/Core/Validator";

const filterSchema = schema.create({
  filter: schema.string.optional({
    trim: true,
  }),
});

export default class CustomerController {
  private service: CustomerService;

  constructor() {
    this.service = new CustomerService();
  }

  public async filter({ auth, request }: HttpContextContract) {
    let { filter } = await request.validate({ schema: filterSchema });
    filter = filter || "";
    const tsquery = filter ? filter?.replace(/\s/g, "+") + ":*" : "";

    const customers = await Customer.query()
      // .debug(true)
      .select("id", "name", "document")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq
          .orWhereRaw("to_tsvector(unaccent(name)) @@ to_tsquery(unaccent(?))", [tsquery])
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
      )
      .orderBy("name", "asc")
      .limit(20);

    return customers;
  }

  public async indicators({ auth, request }: HttpContextContract) {
    let { filter } = await request.validate({ schema: filterSchema });
    filter = filter || "";

    const tsquery = filter ? filter?.replace(/\s/g, "+") + ":*" : "";

    const customers = await Customer.query()
      // .debug(true)
      .select("id", "name", "document")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("is_indicator", true)
      .andWhere((sq) =>
        sq
          .orWhereRaw("to_tsvector(unaccent(name)) @@ to_tsquery(unaccent(?))", [tsquery])
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
      )
      .orderBy("name", "asc")
      .limit(20);

    return customers;
  }

  public async index({ paginate, request, auth }: HttpContextContract) {
    // await request.validate(CustomerIndexValidator);
    const { page, per_page } = paginate;
    const { filter, phone, indicated_id, is_indicator, retired, notes } = request.qs();
    const tsquery = filter ? filter?.replace(/\s/g, "+") + ":*" : "";

    const query = Customer.query()
      // .debug(true)
      .preload("indicator", (sq) => sq.select("id", "name", "document", "natural"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq
          .orWhereRaw("to_tsvector(unaccent(name)) @@ to_tsquery(unaccent(?))", [tsquery])
          .orWhere("email", "iLike", `%${filter}%`)
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
      );

    if (phone) {
      query.andWhere("phone", "iLIKE", `%${phone?.replace(/\D]/g, "")}%`);
    }

    if (indicated_id) {
      query.andWhere("indicated_id", indicated_id?.value);
    }

    if (is_indicator === "true") {
      query.andWhere("is_indicator", true);
    }

    if (retired === "true") {
      query.andWhere("retired", true);
    }

    if (notes) {
      query.andWhere((sq) =>
        sq
          .orWhereRaw("to_tsvector(unaccent(notes)) @@ to_tsquery(unaccent(?))", [`%${notes}%`])
          .orWhereRaw("unaccent(notes) iLike unaccent(?)", [`%${notes}%`])
      );
    }

    const customers = await query.orderBy("name", "asc").paginate(page, per_page);

    return customers.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { roles: { fields: { omit: ["id"] } } },
    });
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { retired, ...data } = await request.validate(CustomerValidator);
    const { tenant_id } = auth.user!;

    const isSigleCustomer = await this.service.isSigleCustomer({ auth, request });
    if (isSigleCustomer instanceof Error) {
      return response.badRequest({ message: isSigleCustomer.message });
    }

    const customer = await Customer.create({
      ...data,
      retired: retired || false,
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
    const customer = await Customer.query()
      .preload("indicator", (sq) => sq.select("id", "name", "document", "natural"))
      .where("id", params.id)
      .firstOrFail();

    await bouncer.with("CustomerPolicy").authorize("tenant", customer);

    return customer;
  }

  public async update({ auth, request, response, params, bouncer }: HttpContextContract) {
    const { retired, email, notes, ...data } = await request.validate(CustomerValidator);
    const customer = await Customer.findOrFail(params.id);

    //policy
    await bouncer.with("CustomerPolicy").authorize("tenant", customer);

    const isSigleCustomer = await this.service.isSigleCustomer({ auth, request, id: params.id });
    if (isSigleCustomer instanceof Error) {
      return response.badRequest({ message: isSigleCustomer.message });
    }

    await customer
      .merge({ ...data, email: email || null, retired: retired || false, notes: notes || null })
      .save();
    await this.service.updateUser(auth, customer.id);

    return customer;
  }

  public async createUser({ auth, params: { id }, response }: HttpContextContract) {
    const user = await this.service.createUser(auth, id);

    if (user instanceof Error) {
      return response.badRequest({ message: user.message });
    }

    return { user_id: user.id };
  }
}
