import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class LastAccess extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public user_id: string;

  @belongsTo(() => User, {
    foreignKey: "user_id",
    localKey: "id",
  })
  public user: BelongsTo<typeof User>;

  @column()
  public user_agent?: string;

  @column()
  public ip?: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
}
