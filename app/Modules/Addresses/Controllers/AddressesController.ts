import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { CustomerValidator } from "../Validators";
import Address from "../Models/Address";
import Order from "App/Modules/Orders/Models/Order";

export default class AddressesController {
  public async addresses({ params: { id } }: HttpContextContract) {
    return Address.query().where("owner_id", id).orderBy("name");
  }

  public async index({}: HttpContextContract) {
    return Address.query().orderBy("name");
  }

  public async store({ auth, request }: HttpContextContract) {
    let { ...data } = await request.validate(CustomerValidator);

    return await Address.create({ ...data, user_id: auth.user?.id });
  }

  public async show({ params: { id } }: HttpContextContract) {
    return await Address.query().where("id", id).firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(CustomerValidator);

    const customer = await Address.findOrFail(id);

    await customer.merge({ ...data, user_id: auth.user?.id }).save();
    return customer;
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const customer = await Address.findOrFail(id);

    const order = await Order.query().where("address_id", id).first();
    if (order) {
      return response.status(400).json({
        message: `Este endereço não pode ser removido pois está sendo utilizado no Orçamento ${order.number}`,
      });
    }

    await customer.delete();
    return response.status(204);
  }
}
