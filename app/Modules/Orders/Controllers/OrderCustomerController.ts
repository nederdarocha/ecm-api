import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Order from "../Models/Order";
import { schema } from "@ioc:Adonis/Core/Validator";
import CustomerOrder from "../Models/CustomerOrder";

export default class OrderCustomerController {
  // CUSTOMERS
  public async getCustomers({ auth, params: { id } }: HttpContextContract) {
    const customerOrder = await CustomerOrder.query()
      // .debug(true)
      .preload("customer", (sq) => sq.select("*").preload("user"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", id);

    return customerOrder.map(({ id, customer }) => ({
      customer_order_id: id,
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      natural: customer.natural,
      user_id: customer.user?.id,
    }));
  }

  public async addCustomer({ auth, request, response, params: { id } }: HttpContextContract) {
    const { customer_id } = await request.validate({
      schema: schema.create({ customer_id: schema.string() }),
    });

    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    const orderCustomer = await CustomerOrder.create({
      tenant_id: auth.user!.tenant_id,
      order_id: order.id,
      customer_id,
      user_id: auth.user!.id,
    });

    await orderCustomer.load("customer");
    const customer = orderCustomer.customer;

    response.status(200).json({
      customer_order_id: orderCustomer.id,
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      natural: customer.natural,
    });
  }

  public async destroyCustomer({
    auth,
    response,
    params: { id, customer_order_id },
  }: HttpContextContract) {
    const caseCustomer = await CustomerOrder.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", id)
      .andWhere("id", customer_order_id)
      .firstOrFail();

    //TODO verificar se cliente possui serviços vinculados ao caso antes de remover
    await caseCustomer.delete();
    response.status(204);
  }
}
