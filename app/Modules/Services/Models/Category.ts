import { DateTime } from "luxon";
import { column, BaseModel } from "@ioc:Adonis/Lucid/Orm";

export default class Category extends BaseModel {
  public static table = "categories";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public status: boolean;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;
}
