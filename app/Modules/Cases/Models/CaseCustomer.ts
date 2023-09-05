import { DateTime } from "luxon";
import {
  column,
  BaseModel,
  manyToMany,
  ManyToMany,
  belongsTo,
  BelongsTo,
} from "@ioc:Adonis/Lucid/Orm";
import Customer from "App/Modules/Customers/Models/Customer";
import Case from "./Case";

export default class CaseCustomer extends BaseModel {
  public static table = "case_customer";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public case_id: string;

  @column()
  public customer_id: string;

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

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;
}
