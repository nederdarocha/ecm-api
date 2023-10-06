import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "../Models/Task";
import { TaskValidator } from "../Validators";
import { StatusService } from "../Services/StatusService";

export default class TaskController {
  private service: StatusService;

  constructor() {
    this.service = new StatusService();
  }

  public async getByOrder({ auth, params: { order_id } }: HttpContextContract) {
    const courts = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return courts.map((court) =>
      court.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async index({ auth }: HttpContextContract) {
    const courts = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("made_at", "asc");

    return courts.map((court) =>
      court.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(TaskValidator);
    const { tenant_id } = auth.user!;

    const court = await Task.create({
      ...data,
      tenant_id,
      user_id: auth.user!.id,
    });

    return court.serialize({
      fields: {
        omit: ["tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, auth }: HttpContextContract) {
    const court = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return court;
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(TaskValidator);
    const court = await Task.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await court.merge(data).save();

    return court;
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
