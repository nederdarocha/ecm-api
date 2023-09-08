import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import ExtraData from "./ExtraData";
import CaseCustomerService from "App/Modules/Cases/Models/CaseCustomerService";

export default class MetaData extends BaseModel {
  public static table = "meta_data";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public extra_data_id: string;

  @column()
  public case_customer_service_id: string;

  @column()
  public name: string;

  @column()
  public value: string;

  @column()
  public customer_id: string;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => ExtraData, {
    foreignKey: "extra_data_id",
    localKey: "id",
  })
  public extra_data: BelongsTo<typeof ExtraData>;

  @belongsTo(() => CaseCustomerService, {
    foreignKey: "case_customer_service_id",
    localKey: "id",
  })
  public case_customer_service: BelongsTo<typeof CaseCustomerService>;
}