import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Category from "./Category";
import { has } from "lodash";
import ExtraData from "./ExtraData";

export default class Service extends BaseModel {
  public static table = "services";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public category_id: string;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public price: number;

  @column()
  public commission: number;

  @column()
  public out_court: boolean;

  @column()
  public status: boolean;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Category, {
    foreignKey: "category_id",
    localKey: "id",
  })
  public category: BelongsTo<typeof Category>;

  @hasMany(() => ExtraData, {
    foreignKey: "service_id",
    localKey: "id",
  })
  public extra_data: HasMany<typeof ExtraData>;
}
