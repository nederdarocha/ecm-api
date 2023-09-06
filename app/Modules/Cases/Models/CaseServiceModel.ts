import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Case from "./Case";
import Service from "App/Modules/Services/Models/Service";

export default class CaseServiceModel extends BaseModel {
  public static table = "case_service";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public case_id: string;

  @column()
  public service_id: string;

  @column()
  public user_id?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Case, {
    foreignKey: "case_id",
    localKey: "id",
  })
  public case: BelongsTo<typeof Case>;

  @belongsTo(() => Service, {
    foreignKey: "service_id",
    localKey: "id",
  })
  public service: BelongsTo<typeof Service>;
}
