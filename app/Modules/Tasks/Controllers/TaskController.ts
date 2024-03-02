import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "../Models/Task";
import { TaskValidator, TaskMadeValidator } from "../Validators";
import TypeTask from "../Models/TypeTask";

export default class TaskController {
  public async index({ auth, request, paginate }: HttpContextContract) {
    const {
      number,
      status_all,
      customer_id,
      service_id,
      make_in_begin,
      make_in_end,
      order_by,
      is_schedule,
      type_task_id,
      users,
    } = request.qs();

    const query = Task.query()
      // .debug(true)
      .preload("confirmedBy", (sq) => sq.select("id", "first_name"))
      .preload("order", (sq) => sq.select("id", "number"))
      .preload("customer", (sq) => sq.select("id", "name"))
      .preload("orderService", (sq) =>
        sq
          .select("*")
          .preload("service", (sq) => sq.select("id", "name"))
          .preload("court", (sq) => sq.select("id", "initials"))
      )
      .preload("typeTask", (sq) => sq.select("id", "name"))
      .preload("users", (sq) => sq.select("id", "first_name", "last_name"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhereNotNull("make_in");

    if (number) {
      query.andWhereHas("order", (query) => query.where("number", "iLike", `%${number}%`));
    }

    if (users) {
      query.andWhereHas("users", (query) => query.whereIn("users.id", users));
    }

    if (status_all === "false") {
      query.andWhere("status", "pending");
    }

    if (is_schedule && is_schedule === "true") {
      query.andWhere("is_schedule", true);
    }
    if (type_task_id) {
      query.andWhere("type_task_id", type_task_id);
    }

    if (customer_id) {
      query.andWhere("customer_id", customer_id);
    }

    if (service_id) {
      query.andWhereHas("orderService", (query) => query.where("service_id", service_id));
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

    const tasks = await query
      .orderBy("make_in", order_by === "asc" ? "asc" : "desc")
      .paginate(paginate.page, paginate.per_page);

    return tasks.serialize({
      fields: {
        omit: ["user_id", "tenant_id", "createdAt", "updatedAt"],
      },
      relations: {
        confirmedBy: { fields: { pick: ["id", "first_name"] } },
        order: { fields: { pick: ["id", "number"] } },
        customer: { fields: { pick: ["id", "name"] } },
        orderService: {
          fields: { pick: ["court_number", "defendant"] },
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
      .preload("orderService", (sq) =>
        sq.select("*").preload("service", (sq) => sq.select("id", "name"))
      )
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return tasks.map((task) =>
      task.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
        relations: {
          orderService: {
            fields: { pick: ["court_number"] },
            relations: {
              court: { fields: { pick: ["initials"] } },
              service: { fields: { pick: ["name"] } },
            },
          },
        },
      })
    );
  }

  public async getByCustomerOrder({
    auth,
    params: { customer_id, order_id },
  }: HttpContextContract) {
    const tasks = await Task.query()
      .preload("orderService", (sq) =>
        sq.select("*").preload("service", (sq) => sq.select("id", "name"))
      )
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .preload("typeTask", (sq) => sq.select("id", "name"))
      .preload("users", (sq) => sq.select("id", "first_name", "last_name"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id)
      .andWhere("customer_id", customer_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return tasks.map((task) =>
      task.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
        relations: {
          orderService: {
            fields: { pick: ["court_number"] },
            relations: {
              court: { fields: { pick: ["initials"] } },
              service: { fields: { pick: ["name"] } },
            },
          },
        },
      })
    );
  }

  public async getByCustomerOrderService({ auth, params: { id } }: HttpContextContract) {
    const tasks = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_service_id", id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return tasks.map((task) =>
      task.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { make_in, users, ...data } = await request.validate(TaskValidator);
    const { tenant_id } = auth.user!;
    let status: "pending" | "confirmed" | "done" | "canceled" = "pending";
    if (make_in) {
      status = "pending";
    }

    const typeTask = await TypeTask.findOrFail(data.type_task_id);
    if (typeTask.name === "Audiência" && !make_in) {
      return response.status(400).json({ message: "Informe a data de Prazo/Agendamento" });
    }

    if (users && users.length > 0 && !make_in) {
      return response.status(400).json({
        message:
          "Você atribuiu usuário(s) por isso é obrigatório informe a data de Prazo/Agendamento",
      });
    }

    const task = await Task.create({
      ...data,
      make_in,
      status,
      tenant_id,
      user_id: auth.user!.id,
    });

    if (users) {
      await task.related("users").sync(users);
    }

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
      .preload("typeTask", (sq) => sq.select("id", "name"))
      .preload("users", (sq) => sq.select("id", "first_name", "last_name"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return task;
  }

  public async update({ auth, request, params: { id }, response }: HttpContextContract) {
    const { make_in, users, ...data } = await request.validate(TaskValidator);
    let status: "pending" | "confirmed" | "done" | "canceled" = "pending";
    if (make_in) {
      status = "pending";
    }

    const typeTask = await TypeTask.findOrFail(data.type_task_id);
    if (typeTask.name === "Audiência" && !make_in) {
      return response.status(400).json({ message: "Informe a data de Prazo/Agendamento" });
    }

    if (users && users.length > 0 && !make_in) {
      return response.status(400).json({
        message:
          "Você atribuiu usuário(s) por isso é obrigatório informe a data de Prazo/Agendamento",
      });
    }

    const task = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    if (users) {
      await task.related("users").sync(users);
    }

    await task.merge({ ...data, make_in: make_in || null, status }).save();

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
