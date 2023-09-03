import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Service from "./Service";

export default class ExtraData extends BaseModel {
  public static table = "extra_data";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public service_id: string;

  @column()
  public order: number;

  @column()
  public label: string;

  @column()
  public name: string;

  @column()
  public type: string;

  @column()
  public options: string;

  @column()
  public decimal_place: number;

  @column()
  public style: string;

  @column()
  public status: boolean;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Service, {
    foreignKey: "service_id",
    localKey: "id",
  })
  public service: BelongsTo<typeof Service>;
}
