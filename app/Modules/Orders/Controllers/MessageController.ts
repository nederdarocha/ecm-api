import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Message from "../Models/Message";
import { MessageValidator } from "../Validators";

export default class MessageController {
  public async getByOrder({ auth, params: { order_id } }: HttpContextContract) {
    const messages = await Message.query()
      .preload("user", (sq) => sq.select("id", "first_name", "last_name"))
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return messages.map((court) =>
      court.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async index({ auth }: HttpContextContract) {
    const messages = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("made_at", "asc");

    return messages.map((court) =>
      court.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request }: HttpContextContract) {
    const { customer_id, ...data } = await request.validate(MessageValidator);
    const { tenant_id } = auth.user!;

    const court = await Message.create({
      ...data,
      customer_id,
      tenant_id,
      user_id: auth.user!.id,
    });

    //TODO cria uma notificação para o usuário
    //verifica se o cliente possui um usuário

    return court.serialize({
      fields: {
        omit: ["tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, auth }: HttpContextContract) {
    const court = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return court;
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(MessageValidator);
    const court = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await court.merge(data).save();

    return court;
  }

  public async destroy({ auth, response, params: { id } }: HttpContextContract) {
    const task = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task.delete();

    return response.status(204);
  }
}
