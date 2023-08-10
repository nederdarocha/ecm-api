import { DateTime } from "luxon";
import { column, BaseModel, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Product from "App/Modules/Products/Models/Product";

export default class Portion extends BaseModel {
  public static table = "portions";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public order: number;

  @column()
  public name: string;

  @column()
  public price_cents: number | null;

  @column()
  public default: boolean;

  @column()
  public status: boolean;

  @column()
  public user_id: string;

  @column()
  public product_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @hasMany(() => Product, {
    foreignKey: "product_id",
    localKey: "id",
  })
  public images: HasMany<typeof Product>;
}
