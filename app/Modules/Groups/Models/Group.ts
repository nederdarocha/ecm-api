import { DateTime } from "luxon";
import { column, BaseModel, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Product from "App/Modules/Products/Models/Product";

export default class Group extends BaseModel {
  public static table = "groups";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column()
  public order: number | null;

  @column()
  public status: boolean | null;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @hasMany(() => Product, {
    foreignKey: "group_id",
    localKey: "id",
  })
  public products: HasMany<typeof Product>;
}
