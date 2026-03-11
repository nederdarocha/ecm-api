import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Category from "App/Modules/Services/Models/Category";

export default class TypeTask extends BaseModel {
  public static table = "type_tasks";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public category_id: string;

  @column()
  public tenant_id: string;

  @column()
  public name: string;

  @column()
  public description?: string | null;

  @column()
  public status: boolean;

  @column()
  public user_id: string;

  @column()
  public type: string;

  @belongsTo(() => Category, {
    foreignKey: "category_id",
    localKey: "id",
  })
  public category: BelongsTo<typeof Category>;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;
}
