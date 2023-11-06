import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Payment from "../Models/Payment";
import { PaymentValidator, MadePaymentValidator } from "../Validators";
import File from "App/Modules/Files/Models/File";
import { PaymentService } from "../Services/PaymentService";

export default class PaymentController {
  private service: PaymentService;

  constructor() {
    this.service = new PaymentService();
  }

  public async index({ auth, request, paginate }: HttpContextContract) {
    const { number, status, service_id, customer_id, due_date_begin, due_date_end, type } =
      request.qs();

    const query = Payment.query()
      .preload("file", (sq) => sq.select("id", "name", "type", "key", "content_type", "size"))
      .preload("paidBy", (sq) => sq.select("id", "first_name"))
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .preload("order", (sq) => sq.select("id", "number"))
      .preload("customerOrderService", (sq) =>
        sq.select("*").preload("service", (sq) => sq.select("id", "name"))
      )
      .where("tenant_id", auth.user!.tenant_id);

    if (number) {
      query.andWhereHas("order", (query) => query.where("number", "iLike", `%${number}%`));
    }

    if (status) {
      query.andWhere("status", status);
    }

    if (service_id) {
      query.andWhereHas("customerOrderService", (query) => query.where("service_id", service_id));
    }

    if (customer_id) {
      query.andWhere("customer_id", customer_id);
    }

    if (due_date_begin && due_date_end) {
      query.andWhereBetween("due_date", [`${due_date_begin} 00:00:00`, `${due_date_end} 23:59:59`]);
    }

    if (due_date_begin && !due_date_end) {
      query.andWhere("due_date", ">=", `${due_date_begin} 00:00:00`);
    }

    if (!due_date_begin && due_date_end) {
      query.andWhere("due_date", "<=", `${due_date_end} 23:59:59`);
    }

    if (type) {
      query.andWhere("type", type);
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

  public async madePayment({ auth, request, response, params: { id } }: HttpContextContract) {
    const { file, paid_cents_value, paid_date } = await request.validate(MadePaymentValidator);
    const { tenant_id } = auth.user!;

    const payment = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    if (file) {
      const name = await this.service.generateName({ auth, file, payment_id: id });

      const _file = await File.create({
        owner_id: payment.id,
        tenant_id,
        name: name,
        type: file.extname,
        user_id: auth.user?.id,
        content_type: file.headers["content-type"],
        is_public: false,
        size: file.size,
      });
      try {
        await file.moveToDisk(
          `${tenant_id}/payments`,
          {
            name: `${_file.id}.${file.extname}`,
            visibility: "private",
            cacheControl: "public,max-age=290304000",
          },
          "s3"
        );

        await _file.merge({ key: `${tenant_id}/payments/${_file.id}.${file.extname}` }).save();
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    }

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

  public async undoPayment({ auth, params: { id } }: HttpContextContract) {
    const payment = await Payment.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    const file = await this.service.checkIfFileExists({ auth, payment_id: id });
    if (file) {
      await file.merge({ owner_id: null, user_id: auth.user?.id }).save();
    }

    await payment
      .merge({
        paid_cents_value: null,
        paid_date: null,
        status: "pending",
        paid_by: null,
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
