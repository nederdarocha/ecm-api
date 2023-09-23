import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Notification from "../Models/Notification";

export default class NotificationController {
  public async me({ auth: { user } }: HttpContextContract) {
    if (!user) return;
    return Notification.query()
      .where("to_id", user.id)
      .orderBy("status", "asc")
      .orderBy("created_at", "desc")
      .limit(5);
  }

  public async checkAllRead({ auth: { user } }: HttpContextContract) {
    if (!user) return;
    await Database.rawQuery("UPDATE notifications set status = 'read' WHERE to_id = :id;", {
      id: user.id,
    });

    return;
  }

  public async index({ auth: { user }, paginate, request }: HttpContextContract) {
    const { page, per_page } = paginate;
    const { filter } = request.qs();

    return Notification.query()
      .whereRaw("unaccent(subject) iLike unaccent(?) ", [`%${filter}%`])
      .orWhereRaw("unaccent(message) iLike unaccent(?) ", [`%${filter}%`])
      .andWhere("to_id", user?.id!)
      .orderBy("subject", "asc")
      .paginate(page, per_page);
  }
}
