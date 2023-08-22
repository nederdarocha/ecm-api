import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { CustomerValidator } from "../Validators";
import Address from "../Models/Address";

export default class AddressesController {
  public async addressesOwner({ auth, params: { id } }: HttpContextContract) {
    return Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", id)
      .orderBy("favorite", "desc");
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const addresses = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("favorite", "desc")
      .paginate(paginate.page, paginate.per_page);

    return addresses.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, request }: HttpContextContract) {
    let { ...data } = await request.validate(CustomerValidator);

    const address = await Address.create({
      ...data,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return address.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(CustomerValidator);

    const address = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.merge({ ...data, user_id: auth.user?.id }).save();
    return address;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const customer = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await customer.delete();
    return response.status(204);
  }
}
