import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { TypeTaskValidator } from "../Validators";
import TypeTask from "../Models/TypeTask";
import Task from "../Models/Task";

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

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(TypeTaskValidator);
    const { tenant_id } = auth.user!;
    const typeTask = await TypeTask.create({ ...data, tenant_id, user_id: auth.user!.id });

    return typeTask.serialize({
      fields: {
        omit: ["user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, auth }: HttpContextContract) {
    const typeTask = await TypeTask.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return typeTask.serialize({
      fields: {
        omit: ["user_id", "tenant_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async update({ auth, request, params: { id }, response }: HttpContextContract) {
    const { ...data } = await request.validate(TypeTaskValidator);

    const typeTask = await TypeTask.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    if (typeTask.name === "Audiência") {
      return response.status(400).send({ message: "Não é possível editar a tarefa Audiência" });
    }

    await typeTask.merge({ ...data, user_id: auth.user!.id }).save();

    return typeTask;
  }

  public async destroy({ auth, response, params: { id } }: HttpContextContract) {
    const typeTask = await TypeTask.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    if (typeTask.name === "Audiência") {
      return response.status(400).send({ message: "Não é possível remover a tarefa Audiência" });
    }

    //TODO validar se typo está sendo usada em alguma tarefa

    const task = await Task.query().where("type_task_id", id).first();
    if (task) {
      return response
        .status(400)
        .send({ message: "Não é possível remover a tarefa, pois ela está sendo usada" });
    }

    await typeTask.delete();

    return response.status(204);
  }
}
