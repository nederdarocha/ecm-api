import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "../Models/Task";
import { TaskValidator, TaskMadeValidator } from "../Validators";
import TypeTask from "../Models/TypeTask";

export default class TypeTaskController {
  public async index({ auth }: HttpContextContract) {
    const typeTasks = await TypeTask.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");

    return typeTasks.map((typeTask) =>
      typeTask.serialize({
        fields: {
          omit: ["user_id", "tenant_id", "createdAt", "updatedAt"],
        },
      })
    );
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { make_in, ...data } = await request.validate(TaskValidator);
    const { tenant_id } = auth.user!;
    let status: "pending" | "confirmed" | "done" | "canceled" = "pending";
    if (make_in) {
      status = "pending";
    }

    if (data.is_schedule && !make_in) {
      return response.status(400).json({ message: "Informe a data de Prazo/Agendamento" });
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

  public async update({ auth, request, params: { id }, response }: HttpContextContract) {
    //TODO impedir a edição da tarefa audiência

    const { make_in, ...data } = await request.validate(TaskValidator);
    let status: "pending" | "confirmed" | "done" | "canceled" = "pending";
    if (make_in) {
      status = "pending";
    }

    if (data.is_schedule && !make_in) {
      return response.status(400).json({ message: "Informe a data de Prazo/Agendamento" });
    }

    const task = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task.merge({ ...data, make_in: make_in || null, status }).save();

    return task;
  }

  public async destroy({ auth, response, params: { id } }: HttpContextContract) {
    //TODO impedir a exclusão de tarefa audiência

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
