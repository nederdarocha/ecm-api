import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Payment from "../Models/Payment";
import { PaymentValidator } from "../Validators";

export default class PaymentController {
  public async filter({ auth, request }: HttpContextContract) {
    const { filter } = request.qs();
    const courts = await Payment.query()
      .select("id", "name", "initials")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq.orWhere("name", "iLike", `%${filter}%`).orWhere("initials", "iLike", `%${filter}%`)
      )
      .orderBy("initials", "asc")
      .limit(20);

    return courts;
  }

  public async index({ auth }: HttpContextContract) {
    // await request.validate(CourtIndexValidator);

    const courts = await Payment.query()
      // .debug(true)
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("initials", "asc");

    return courts.map((payment) =>
      payment.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(PaymentValidator);
    const { tenant_id } = auth.user!;

    const payment = await Payment.create({
      ...data,
      tenant_id,
      user_id: auth.user!.id,
    });

    return payment.serialize({
      fields: {
        omit: ["tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async getByCustomerOrderService({ params: { id }, auth }: HttpContextContract) {
    const payments = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_order_service_id", id)
      .orderBy("due_date", "asc");
    return payments;
  }

  public async show({ params, auth }: HttpContextContract) {
    const payment = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return payment;
  }

  public async update({ auth, request, params }: HttpContextContract) {
    const { ...data } = await request.validate(PaymentValidator);
    const payment = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    await payment.merge(data).save();

    return payment;
  }

  public async destroy({ response, params: { id }, auth }: HttpContextContract) {
    const payment = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await payment.delete();
    return response.status(204);
  }
}
