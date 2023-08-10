import { DateTime } from "luxon";

import { column, BaseModel, hasMany, HasMany, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";

import Image from "App/Modules/Images/Models/Image";
import Group from "App/Modules/Groups/Models/Group";

export default class Product extends BaseModel {
  public static table = "products";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public order: number;

  @column()
  public slug: string;

  @column()
  public description?: string;

  @column()
  public cover?: string;

  @column()
  public measured: string;

  @column()
  public price_cents: number;

  @column()
  public price_cents_discount: number | null;

  @column()
  public quantity_min: number;

  @column()
  public increase: number;

  @column()
  public quantity_max: number;

  @column()
  public highlight: boolean;

  @column()
  public available: boolean;

  @column()
  public status: boolean;

  @column()
  public user_id: string;

  @column()
  public group_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @hasMany(() => Image, {
    foreignKey: "owner_id",
    localKey: "id",
  })
  public images: HasMany<typeof Image>;

  @hasOne(() => Group, {
    foreignKey: "id",
    localKey: "group_id",
  })
  public group: HasOne<typeof Group>;
}
