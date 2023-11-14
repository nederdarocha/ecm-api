import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Notification from "../Models/Notification";
import { NotificationService } from "../Services/NotificationService";
import { DateTime } from "luxon";

export default class NotificationController {
  private service: NotificationService;
  constructor() {
    this.service = new NotificationService();
  }

  public async latestUnread({ auth }: HttpContextContract) {
    const { user } = auth;
    if (!user) return;

    await this.service.createNotifyExpiringTask({ auth });

    const notifications = await Notification.query()
      .where("tenant_id", auth.user?.tenant_id!)
      .andWhere("to_id", user.id)
      .orderBy("status", "desc")
      .orderBy("created_at", "desc")
      .limit(5);

    return notifications.map((notification) =>
      notification.serialize({
        fields: { omit: ["from_id", "to_id", "tenant_id", "user_id", "updated_at"] },
      })
    );
  }

  public async markAllRead({ auth: { user } }: HttpContextContract) {
    if (!user) return;
    await Database.rawQuery(
      "UPDATE notifications set status = 'read', read_at = now() WHERE tenant_id = :tenant_id AND to_id = :id;",
      {
        tenant_id: user.tenant_id,
        id: user.id,
      }
    );

    return;
  }

  public async index({ auth: { user }, paginate, request }: HttpContextContract) {
    const { page, per_page } = paginate;
    const { filter } = request.qs();

    const notifications = await Notification.query()
      .where("tenant_id", user?.tenant_id!)
      .andWhere("to_id", user?.id!)
      .andWhere((sq) => {
        sq.orWhereRaw("unaccent(subject) iLike unaccent(?) ", [`%${filter}%`]);
        sq.orWhereRaw("unaccent(message) iLike unaccent(?) ", [`%${filter}%`]);
      })
      .orderBy("created_at", "desc")
      .orderBy("subject", "asc")
      .paginate(page, per_page);

    // return notifications;
    return notifications.serialize({
      fields: { omit: ["from_id", "to_id", "tenant_id", "user_id", "updated_at"] },
    });
  }

  public async show({ auth: { user }, params: { id } }: HttpContextContract) {
    const notification = await Notification.query()
      .preload("from", (sq) => sq.select("id", "first_name", "last_name"))
      .where("tenant_id", user?.tenant_id!)
      .andWhere("to_id", user?.id!)
      .andWhere("id", id)
      .firstOrFail();

    if (notification.status === "unread") {
      await notification
        .merge({
          status: "read",
          read_at: DateTime.now(), //TODO verificar pq não está salvando a hora
        })
        .save();
    }

    return notification.serialize({
      fields: { omit: ["from_id", "to_id", "tenant_id", "user_id", "updated_at"] },
    });
  }
}
