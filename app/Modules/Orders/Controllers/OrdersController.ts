import { DateTime } from "luxon";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { OrderAcceptValidator, OrderValidator } from "../Validators";
import { OrderService } from "../Services/OrderService";
import Order from "../Models/Order";
import Payment from "../Models/Payment";

export default class OrdersController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  public async list({ params: { filter } }: HttpContextContract) {
    return Order.query()
      .select("id", "document", "name")
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("document", "iLike", `%${filter.replace(/[.|-]/g, "")}%`)
      .orderBy("name", "asc")
      .limit(50);
  }

  public async index({ paginate, request }: HttpContextContract) {
    const { page, limit } = paginate;
    const {
      number,
      customer_id,
      responsible_id,
      product_ids,
      date_started,
      date_ended,
      description,
      accepted,
      status,
    } = request.qs();

    const query = Order.query();

    if (accepted && accepted === "true") {
      query.where("number", "iLike", `%${number}%`).andWhere("accepted", "=", true);
    } else {
      query.where("budget", "iLike", `%${number}%`);
    }

    if (customer_id) {
      query.andWhereHas("customer", (query) => query.whereIn("id", [customer_id]));
    }

    if (responsible_id) {
      query.andWhereHas("responsible", (query) => query.whereIn("id", [responsible_id]));
    }

    if (product_ids) {
      query.andWhereHas("items", (query) => query.whereIn("product_id", product_ids));
    }

    if (date_started && date_ended) {
      query.andWhereBetween("created_at", [`${date_started} 00:00:00`, `${date_ended} 23:59:59`]);
    }

    if (date_started && !date_ended) {
      query.andWhere("created_at", ">=", `${date_started} 00:00:00`);
    }

    if (!date_started && date_ended) {
      query.andWhere("created_at", "<=", `${date_ended} 23:59:59`);
    }

    if (description) {
      query.andWhere("description", "iLike", `%${description}%`);
    }

    if (status) {
      query.andWhere("status", status);
    }

    return query
      .preload("customer")
      .preload("address")
      .preload("responsible")
      .preload("payments", (query) => {
        query.orderBy("due_date", "asc");
      })
      .preload("items", (itemsQuery) => {
        itemsQuery.preload("product");
      })
      .orderBy(accepted === "true" ? "accepted_at" : "created_at", "desc")
      .orderBy("number", "desc")
      .paginate(page, limit);
  }

  public async listProducing({ request }: HttpContextContract) {
    const { number, status, product_id } = request.qs();

    const query = Order.query();

    if (number) {
      query.where("number", "iLike", `%${number}%`);
    }

    if (!number && status) {
      query.whereIn("status", ["Confirmado", "Produzindo"]);
    }

    if (!number && product_id) {
      query.andWhereHas("items", (query) => query.where("product_id", product_id));
    }

    query.where("accepted", true);

    const orders = await query
      .preload("items", (itemsQuery) => {
        itemsQuery.preload("product");
      })
      .orderBy("number", "desc");

    return orders;
  }

  public async listWaiting() {
    return Order.query()
      .where("status", "Confirmado")
      .preload("customer")
      .preload("address")
      .preload("responsible")
      .preload("payments")
      .preload("items", (itemsQuery) => {
        itemsQuery.preload("product");
      })
      .orderBy("accepted_at", "desc");
  }

  public async listLate() {
    return Order.query()
      .whereNot("status", "Produzido")
      .andWhereNotNull("accepted_at")
      .andWhereRaw("(accepted_at + INTERVAL '1 day' * build_days) < (NOW() - INTERVAL '15 days' )")
      .preload("customer")
      .orderBy("accepted_at", "desc")
      .limit(10);
  }

  public async show({ params: { id } }: HttpContextContract) {
    return this.service.getOrderById(id);
  }

  public async store({ auth, request, response }: HttpContextContract) {
    let { commission, ...data } = await request.validate(OrderValidator);

    //remover commission caso responsável não informado
    if (!data.responsible_id) {
      commission = null;
    }

    if (data.customer_id === data.responsible_id) {
      return response
        .status(422)
        .json({ message: "Você informou a mesma pessoa como Cliente e Responsável Técnico" });
    }

    const budget = await this.service.getNextNumber("budget");

    return await Order.create({
      ...data,
      commission,
      budget,
      user_id: auth.user?.id,
      status: "Rascunho",
    });
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { commission, discount, shipping, responsible_id, description, ...data } =
      await request.validate(OrderValidator);
    discount = discount ? discount : null;
    shipping = shipping ? shipping : null;
    description = description ? description : null;

    //remover commission caso responsável não informado
    if (!responsible_id) {
      responsible_id = null;
      commission = null;
    }

    const order = await Order.findOrFail(id);

    await order
      .merge({
        ...data,
        responsible_id,
        commission,
        discount,
        shipping,
        description,
        user_id: auth.user?.id,
      })
      .save();

    return this.service.getOrderById(id);
  }

  public async destroy({ params: { id }, response }: HttpContextContract) {
    const customer = await Order.findOrFail(id);
    await customer.delete();
    return response.status(204);
  }

  public async accept(ctx: HttpContextContract) {
    const {
      params: { id },
      request,
      auth,
    } = ctx;

    const { is_updated_date, date } = await request.validate(OrderAcceptValidator);

    const order = await Order.findOrFail(id);

    if (is_updated_date) {
      const payments = await this.service.getConditionsPayment({
        order_id: id,
        payment_method_id: order.payment_method_id!,
        ctx,
        date_started: date,
      });
      await this.service.destroyPaymentOpened(id);
      await order.related("payments").createMany(payments);
    }

    await Payment.query().update({ accepted: true }).where("order_id", id);

    const expected_date: DateTime = date.plus({ days: order.build_days });

    const commission = await this.service.getCommissionPayment({ order_id: id, ctx });
    if (commission) {
      await order.related("payments").create(commission);
    }

    const number = await this.service.getNextNumber("number");
    await order
      .merge({
        number,
        expected_date,
        status: "Confirmado",
        accepted: true,
        accepted_at: DateTime.now(),
        accepted_by: auth.user?.id,
      })
      .save();

    return await this.service.getOrderById(id);
  }
}
