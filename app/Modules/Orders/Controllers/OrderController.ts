import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { DateTime } from "luxon";
import { OrderValidator } from "../Validators";
import Order from "../Models/Order";
import { OrderService } from "../Services/OrderService";
import { schema } from "@ioc:Adonis/Core/Validator";
import CustomerOrderService from "../Models/CustomerOrderService";

export default class OrderController {
  private service: OrderService;
  constructor() {
    this.service = new OrderService();
  }

  public async index({ auth, request, paginate }: HttpContextContract) {
    const { number, status_id, service_id, court_id, court_number, customer_id, indicated_id } =
      request.qs();

    const query = CustomerOrderService.query()
      .preload("order", (sq) => sq.select("*").preload("status", (sq) => sq.select(["id", "name"])))
      .preload("customer", (sq) => sq.select(["id", "name", "document", "natural"]))
      .preload("court", (sq) => sq.select(["id", "initials", "name"]))
      .preload("service", (sq) => sq.select(["id", "name"]))
      .where("tenant_id", auth.user!.tenant_id);

    if (number) {
      query.andWhereHas("order", (query) => query.where("number", "iLike", `%${number}%`));
    }

    if (status_id) {
      query.andWhereHas("order", (query) => query.whereIn("status_id", [status_id]));
    }

    if (service_id) {
      query.andWhere("service_id", service_id);
    }

    if (court_id) {
      query.andWhere("court_id", court_id);
    }

    if (court_number) {
      query.andWhereRaw(`REGEXP_REPLACE(court_number ,'\D','','g') iLike ?`, [`%${court_number}%`]);
    }

    if (customer_id) {
      query.andWhereHas("customer", (query) => query.whereIn("customer_id", [customer_id]));
    }

    if (indicated_id) {
      query.andWhereHas("customer", (query) => query.whereIn("indicated_id", [indicated_id]));
    }

    const orders = await query.paginate(paginate.page, paginate.per_page);
    const _orders = orders.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { order: { fields: { omit: ["tenant_id", "user_id", "status_id"] } } },
    });

    const drafts = await this.service.getOrdersDrafts(auth);

    if (drafts.length > 0) {
      _orders.data = [...drafts, ..._orders.data];
    }

    return _orders;
  }

  public async getByCustomer({ auth, params: { customer_id } }: HttpContextContract) {
    const orders = await CustomerOrderService.query()
      .preload("order", (sq) =>
        sq
          .select(["id", "order", "number", "started_at", "ended_at", "status_id"])
          .preload("status", (sq) => sq.select(["id", "name"]))
      )
      .preload("service", (sq) => sq.select(["id", "name"]))
      .preload("court", (sq) => sq.select(["id", "initials", "name"]))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_id", customer_id);

    return orders.map((order) =>
      order.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
        relations: { customerOrderServices: { fields: { omit: ["tenant_id", "user_id"] } } },
      })
    );
  }

  public async store({ auth, response }: HttpContextContract) {
    const isOrderDraft = await this.service.getOrderDraft(auth);
    if (isOrderDraft) {
      return response.status(200).json({
        data: isOrderDraft.toJSON(),
        message: "Use este rascunho para aproveitar o número gerado.",
      });
    }

    const nextOrder = await this.service.getNextSequence(auth);
    const number = await this.service.getNextNumber(auth);
    const status_id = await this.service.getInitialStatus();
    const order = await Order.create({
      order: nextOrder,
      number,
      started_at: DateTime.now(),
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
      status_id,
    });

    return order.serialize({
      fields: { omit: ["tenant_id", "user_id", "order"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Order.query()
      .preload("status", (sq) => sq.select(["id", "name"]))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { notes, ...data } = await request.validate(OrderValidator);

    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await order.merge({ ...data, notes: notes || "", user_id: auth.user?.id }).save();
    await order.load("status", (sq) => sq.select(["id", "name"]));

    return order;
  }

  public async updateNotes({ auth, request, params: { id } }: HttpContextContract) {
    let { notes, status_id } = await request.validate({
      schema: schema.create({
        status_id: schema.string({ trim: true }),
        notes: schema.string.optional({ trim: true }),
      }),
    });

    const order = await Order.query()

      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await order.merge({ status_id, notes: notes || "", user_id: auth.user?.id }).save();
    await order.load("status", (sq) => sq.select(["id", "name"]));

    return order;
  }

  public async destroy({ auth, params: { id } }: HttpContextContract) {
    console.log("aqui");
    //TODO: implementar soft delete
    // verificar se é a mais recente para apagar
    // verificar se há clientes
    // verificar se há possíveis notificações relacionadas
    // verificar se há tarefas relacionadas
    return await Order.query()
      .preload("status", (sq) => sq.select(["id", "name"]))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }
}
