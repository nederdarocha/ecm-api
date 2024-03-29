import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { DateTime } from "luxon";
import { OrderValidator } from "../Validators";
import Order from "../Models/Order";
import { OrderService } from "../Services/OrderService";
import { format } from "date-fns";
import CustomerOrder from "../Models/CustomerOrder";
import User from "App/Modules/Users/Models/User";

export default class OrderController {
  private service: OrderService;
  constructor() {
    this.service = new OrderService();
  }

  public async index({ auth, request, paginate }: HttpContextContract) {
    const {
      number,
      defendant,
      status_id,
      service_id,
      court_id,
      court_number,
      customer_id,
      indicated_id,
      date_start,
      date_end,
      notes,
    } = request.qs();

    const query = Order.query()
      .preload("status", (sq) => sq.select(["id", "name"]))
      .preload("orderServices", (sq) => sq.select("*").preload("court").preload("service"))
      .preload("customers", (sq) =>
        sq.select("*").preload("indicator").select(["id", "name", "document", "natural"])
      )
      .where("tenant_id", auth.user!.tenant_id);

    if (number) {
      query.andWhere("number", "iLike", `%${number}%`);
    }

    if (defendant) {
      query.andWhereHas("orderServices", (query) =>
        query.andWhereRaw("unaccent(defendant) iLike unaccent(?)", [`%${defendant}%`])
      );
    }

    if (status_id) {
      query.andWhere("status_id", status_id?.value);
    }

    if (service_id) {
      query.andWhereHas("orderServices", (query) => query.where("service_id", service_id?.value));
    }

    if (court_id) {
      query.andWhereHas("orderServices", (query) => query.where("court_id", court_id?.value));
    }

    if (court_number) {
      query.andWhereHas("orderServices", (query) =>
        query.andWhereRaw(`REGEXP_REPLACE(court_number ,'\D','','g') iLike ?`, [
          `%${court_number}%`,
        ])
      );
    }

    if (customer_id) {
      query.andWhereHas("customers", (query) => query.where("customer_id", customer_id?.value));
    }

    if (indicated_id) {
      query.andWhereHas("customers", (query) => query.where("indicated_id", indicated_id?.value));
    }

    if (date_start && date_end) {
      query.andWhereBetween("created_at", [
        `${format(new Date(date_start), "yyyy-MM-dd")} 00:00:00`,
        `${format(new Date(date_end), "yyyy-MM-dd")} 23:59:59`,
      ]);
    }

    if (date_start && !date_end) {
      query.andWhere("created_at", ">=", `${format(new Date(date_start), "yyyy-MM-dd")} 00:00:00`);
    }

    if (!date_start && date_end) {
      query.andWhere("created_at", "<=", `${format(new Date(date_end), "yyyy-MM-dd")} 23:59:59`);
    }

    if (notes) {
      query.andWhere((sq) =>
        sq
          .orWhereRaw("to_tsvector(unaccent(notes)) @@ to_tsquery(unaccent(?))", [`%${notes}%`])
          .orWhereRaw("unaccent(notes) iLike unaccent(?)", [`%${notes}%`])
      );
    }

    const order = paginate?.per_page! < 0 ? "asc" : "desc";
    const orders = await query.orderBy("order", order).paginate(paginate.page, paginate.per_page);

    return orders.serialize({
      fields: { pick: ["id", "order", "number", "started_at", "ended_at"] },
      relations: {
        status: { fields: { pick: ["name"] } },
        customers: {
          fields: { pick: ["id", "name", "document", "natural"] },
          relations: {
            indicator: { fields: { pick: ["id", "name", "document", "natural"] } },
          },
        },
        orderServices: {
          fields: { pick: ["court_number", "defendant"] },
          relations: {
            court: { fields: { pick: ["initials"] } },
            service: { fields: { pick: ["name", "defendant"] } },
          },
        },
      },
    });
  }

  public async getOrdersByUser({ auth, paginate }: HttpContextContract) {
    const user = await User.findOrFail(auth.user!.id);
    if (!user?.customer_id) {
      return [];
    }

    const query = Order.query()
      .preload("orderServices", (sq) => sq.select("*").preload("court").preload("service"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhereHas("customers", (query) => query.where("customer_id", user?.customer_id!));

    const orders = await query.orderBy("order", "desc").paginate(paginate.page, paginate.per_page);

    return orders.serialize({
      fields: { pick: ["id", "number", "started_at", "ended_at"] },
      relations: {
        status: { fields: { pick: ["name"] } },
        customers: {
          fields: { pick: ["id", "name", "document", "natural"] },
          relations: {
            indicator: { fields: { pick: ["id", "name", "document", "natural"] } },
          },
        },
        orderServices: {
          fields: { pick: ["court_number", "defendant"] },
          relations: {
            court: { fields: { pick: ["initials"] } },
            service: { fields: { pick: ["name"] } },
          },
        },
      },
    });
  }

  public async getByCustomer({ auth, params: { customer_id } }: HttpContextContract) {
    const orders = await Order.query()
      // .debug(true)
      .select(["id", "number", "started_at", "ended_at", "status_id"])
      .preload("status", (sq) => sq.select(["id", "name"]))
      .preload("orderServices", (sq) => sq.select("*").preload("court").preload("service"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhereHas("customers", (query) => query.where("customer_id", customer_id))
      .orderBy("order", "asc");

    return orders.map((order) =>
      order.serialize({
        fields: { pick: ["id", "order", "number", "started_at", "ended_at"] },

        relations: {
          status: { fields: { pick: ["name"] } },
          orderServices: {
            fields: { pick: ["court_number", "defendant"] },
            relations: {
              court: { fields: { pick: ["initials"] } },
              service: { fields: { pick: ["name", "defendant"] } },
            },
          },
        },
      })
    );
  }

  public async getOrderByUser({ auth, params: { id } }: HttpContextContract) {
    const user = await User.findOrFail(auth.user!.id);
    if (!user?.customer_id) {
      return [];
    }

    const order = await Order.query()
      .preload("messages")
      .preload("orderServices", (sq) => sq.select("*").preload("court").preload("service"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .andWhereHas("customers", (query) => query.where("customer_id", user?.customer_id!))
      .firstOrFail();

    return order.serialize({
      fields: { pick: ["id", "order", "number", "started_at", "ended_at"] },

      relations: {
        messages: { fields: { pick: ["id", "message", "made_at"] } },
        status: { fields: { pick: ["name"] } },
        orderServices: {
          fields: { pick: ["court_number"] },
          relations: {
            court: { fields: { pick: ["initials"] } },
            service: { fields: { pick: ["name"] } },
          },
        },
      },
    });
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const requestSchema = schema.create({
      customer_id: schema.string.nullableAndOptional({ trim: true }, [rules.uuid()]),
    });

    const { customer_id } = await request.validate({ schema: requestSchema });

    const isOrderDraft = await this.service.getOrderDraft(auth);
    if (isOrderDraft) {
      if (customer_id) {
        await CustomerOrder.create({
          tenant_id: auth.user?.tenant_id,
          order_id: isOrderDraft.id,
          customer_id,
          user_id: auth.user!.id,
        });

        await isOrderDraft.merge({ draft: false }).save();
      }

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
      draft: true,
    });

    if (customer_id) {
      await CustomerOrder.create({
        tenant_id: auth.user?.tenant_id,
        order_id: order.id,
        customer_id,
        user_id: auth.user!.id,
      });
      await order.merge({ draft: false }).save();
    }

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

  public async destroy({ auth, response, params: { id } }: HttpContextContract) {
    const order = await Order.query()
      .preload("customers", (sq) => sq.select(["id"]))
      .preload("services", (sq) => sq.select(["id"]))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    const isLastOrder = await this.service.isLastOrder(order);
    if (!isLastOrder) {
      return response.status(400).json({
        message: "Para manter a sequência você só pode excluir o último contrato criado.",
      });
    }
    if (order.customers.length > 0 && order.services.length > 0) {
      return response.status(400).json({
        message: "Não é possível excluir um contrato com clientes e/ou serviços.",
      });
    }

    //TODO: implementar soft delete
    // verificar se há possíveis notificações relacionadas

    await order.delete();
    return response.status(204);
  }
}
