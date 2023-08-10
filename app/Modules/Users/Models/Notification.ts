import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo, afterSave } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Cache from "App/Modules/Cache/Models/Cache";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Notification extends BaseModel {
  public static table = "notifications";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public subject: string;

  @column()
  public message: string;

  @column()
  public status: string;

  @column()
  public user_id: string;

  @column()
  public from_id: string;

  @column()
  public to_id: string;

  @column()
  public go_to: string;

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy HH:MM") : null;
    },
  })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @belongsTo(() => User, {
    foreignKey: "from_id",
    localKey: "id",
  })
  public from: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "to_id",
    localKey: "id",
  })
  public to: BelongsTo<typeof User>;

  @afterSave()
  public static async hashPassword(notification: Notification) {
    const pendingNotifications = await Database.from("notifications")
      .where("to_id", notification.to_id)
      .andWhere("status", "pending")
      .count("* as total");

    await Cache.firstOrCreate(
      { key: `notification-${notification.to_id}` },
      { value: `{notification:${pendingNotifications[0].total}}` }
    );
  }
}
