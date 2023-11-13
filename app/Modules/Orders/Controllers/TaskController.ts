import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "../Models/Task";
import { TaskValidator, TaskMadeValidator } from "../Validators";

export default class TaskController {
  public async index({ auth, request, paginate }: HttpContextContract) {
    const { number, status, customer_id, make_in_begin, make_in_end } = request.qs();

    const query = Task.query()
      .preload("confirmedBy", (sq) => sq.select("id", "first_name"))
      .preload("order", (sq) => sq.select("id", "number"))
      .preload("customer", (sq) => sq.select("id", "name"))
      .preload("orderService", (sq) =>
        sq
          .select("*")
          .preload("service", (sq) => sq.select("id", "name"))
          .preload("court", (sq) => sq.select("id", "initials"))
      )
      .where("tenant_id", auth.user!.tenant_id)
      .andWhereNotNull("make_in");

    if (number) {
      query.andWhereHas("order", (query) => query.where("number", "iLike", `%${number}%`));
    }

    if (status) {
      query.andWhere("status", status);
    }

    if (customer_id) {
      query.andWhere("customer_id", customer_id);
    }

    if (make_in_begin && make_in_end) {
      query.andWhereBetween("make_in", [`${make_in_begin} 00:00:00`, `${make_in_end} 23:59:59`]);
    }

    if (make_in_begin && !make_in_end) {
      query.andWhere("make_in", ">=", `${make_in_begin} 00:00:00`);
    }

    if (!make_in_begin && make_in_end) {
      query.andWhere("make_in", "<=", `${make_in_end} 23:59:59`);
    }

    const tasks = await query.orderBy("make_in", "asc").paginate(paginate.page, paginate.per_page);

    return tasks.serialize({
      fields: {
        omit: ["user_id", "tenant_id", "createdAt", "updatedAt"],
      },
      relations: {
        confirmedBy: { fields: { pick: ["id", "first_name"] } },
        order: { fields: { pick: ["id", "number"] } },
        customer: { fields: { pick: ["id", "name"] } },
        orderService: {
          fields: { pick: ["court_number"] },
          relations: {
            court: { fields: { pick: ["initials"] } },
            service: { fields: { pick: ["name"] } },
          },
        },
      },
    });
  }

  public async getByOrder({ auth, params: { order_id } }: HttpContextContract) {
    const tasks = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return tasks.map((task) =>
      task.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async getByCustomerOrderService({ auth, params: { id } }: HttpContextContract) {
    const tasks = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_order_service_id", id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return tasks.map((task) =>
      task.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request }: HttpContextContract) {
    const { make_in, ...data } = await request.validate(TaskValidator);
    const { tenant_id } = auth.user!;
    let status: "pending" | "confirmed" | "done" | "canceled" = "pending";
    if (make_in) {
      status = "pending";
    }

    const task = await Task.create({
      ...data,
      make_in,
      status,
      tenant_id,
      user_id: auth.user!.id,
    });

    return task.serialize({
      fields: {
        omit: ["user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, auth }: HttpContextContract) {
    const task = await Task.query()
      .preload("confirmedBy", (sq) => sq.select("id", "first_name"))
      .preload("order", (sq) => sq.select("id", "number"))
      .preload("customer", (sq) => sq.select("id", "name"))
      .preload("orderService", (sq) =>
        sq.select("*").preload("service", (sq) => sq.select("id", "name"))
      )
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return task;
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { make_in, ...data } = await request.validate(TaskValidator);
    let status: "pending" | "confirmed" | "done" | "canceled" = "pending";
    if (make_in) {
      status = "pending";
    }
    const task = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task.merge({ ...data, make_in, status }).save();

    return task;
  }

  public async destroy({ auth, response, params: { id } }: HttpContextContract) {
    const task = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task.delete();

    return response.status(204);
  }

  public async confirmTask({ auth, request, params: { id } }: HttpContextContract) {
    const { notes, confirmed_at } = await request.validate(TaskMadeValidator);
    const task = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task
      .merge({
        notes,
        confirmed_at,
        status: "confirmed",
        confirmed_by: auth.user!.id,
      })
      .save();

    return task;
  }

  public async undoConfirmTask({ auth, params: { id } }: HttpContextContract) {
    const task = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task
      .merge({
        notes: null,
        confirmed_at: null,
        confirmed_by: null,
        status: "pending",
      })
      .save();

    return task;
  }
}
