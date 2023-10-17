import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Payment from "../Models/Payment";
import { PaymentValidator, MadePaymentValidator } from "../Validators";

export default class PaymentController {
  public async index({ auth, request, paginate }: HttpContextContract) {
    const { customer_id, status } = request.qs();

    const query = Payment.query()
      .preload("paidBy", (sq) => sq.select("id", "first_name"))
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .preload("order", (sq) => sq.select("id", "number"))
      .preload("customerOrderService", (sq) =>
        sq.select("*").preload("service", (sq) => sq.select("id", "name"))
      )
      .where("tenant_id", auth.user!.tenant_id);

    if (status) {
      query.andWhere("status", status);
    }

    if (customer_id) {
      query.andWhere("customer_id", customer_id);
    }

    const payments = await query
      .orderBy("due_date", "asc")
      .paginate(paginate.page, paginate.per_page);

    return payments.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(PaymentValidator);
    const { tenant_id } = auth.user!;

    const payment = await Payment.create({
      ...data,
      tenant_id,
      user_id: auth.user!.id,
      status: "pending", // made
      // type: "receivable", // payable
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

  public async madePayment({ auth, request, params: { id } }: HttpContextContract) {
    const { paid_cents_value, paid_date } = await request.validate(MadePaymentValidator);
    const payment = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await payment
      .merge({
        paid_cents_value,
        paid_date,
        status: "made",
        paid_by: auth.user!.id,
      })
      .save();

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

    if (payment.status === "made") {
      return response
        .status(400)
        .json({ message: "Não é possível excluir um pagamento confirmado." });
    }

    await payment.delete();
    return response.status(204);
  }
}
