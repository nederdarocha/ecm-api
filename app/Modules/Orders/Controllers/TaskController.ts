import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "../Models/Task";
import { TaskValidator } from "../Validators";

export default class TaskController {
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

  public async index({ auth }: HttpContextContract) {
    const tasks = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("made_at", "asc");

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
        omit: ["tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, auth }: HttpContextContract) {
    const task = await Task.query()
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
}
