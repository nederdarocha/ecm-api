import { DateTime } from "luxon";
import { column, BaseModel } from "@ioc:Adonis/Lucid/Orm";

export default class Cache extends BaseModel {
  public static table = "cache";
  public static primaryKey = "key";

  @column()
  public key: string;

  @column()
  public value: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
}
