import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Message from "../Models/Message";
import { MessageValidator } from "../Validators";
import { MessageService } from "../Services/MessageService";
import Notification from "App/Modules/Users/Models/Notification";

export default class MessageController {
  private service: MessageService;

  constructor() {
    this.service = new MessageService();
  }

  public async getByOrder({ auth, params: { order_id } }: HttpContextContract) {
    const messages = await Message.query()
      .preload("user", (sq) => sq.select("id", "first_name", "last_name"))
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("order_id", order_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return messages.map((message) =>
      message.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async getByCustomer({ auth, params: { customer_id } }: HttpContextContract) {
    const messages = await Message.query()
      .preload("user", (sq) => sq.select("id", "first_name", "last_name"))
      .preload("order", (sq) => sq.select("id", "number"))
      .preload("notification", (sq) => sq.select("status", "read_at"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("customer_id", customer_id)
      .orderBy("made_at", "asc")
      .orderBy("created_at", "asc");

    return messages.map((message) =>
      message.serialize({
        fields: { omit: ["tenant_id", "user_id", "channel", "direction"] },
      })
    );
  }

  public async index({ auth }: HttpContextContract) {
    const messages = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("made_at", "asc");

    return messages.map((message) =>
      message.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request }: HttpContextContract) {
    const { customer_id, ...data } = await request.validate(MessageValidator);
    const { tenant_id } = auth.user!;

    const message = await Message.create({
      ...data,
      customer_id,
      tenant_id,
      user_id: auth.user!.id,
    });

    // TODO cria uma notificação para o usuário
    // verifica se o cliente possui um usuário

    const user_id = await this.service.getUserIdByCustomer(customer_id, auth);
    if (user_id instanceof Error) {
      return "Ok";
    }

    // prepara a notificaçào
    await Notification.create({
      tenant_id,
      relation_id: message.id,
      subject: "Novo andamento processual",
      message: data.message,
      status: "unread",
      user_id: auth.user!.id,
      from_id: null,
      to_id: user_id,
    });

    return "OK";
  }

  public async show({ params, auth }: HttpContextContract) {
    const message = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return message;
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(MessageValidator);
    const message = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await message.merge(data).save();

    return message;
  }

  public async destroy({ auth, response, params: { id } }: HttpContextContract) {
    await Notification.query().where("relation_id", id).delete();

    const task = await Message.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await task.delete();

    return response.status(204);
  }
}
