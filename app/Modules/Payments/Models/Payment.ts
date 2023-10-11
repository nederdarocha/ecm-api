import { DateTime } from "luxon";
import { column, BaseModel } from "@ioc:Adonis/Lucid/Orm";

export default class Court extends BaseModel {
  public static table = "payments";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public order_id: string;

  @column()
  public customer_order_service_id: string;

  @column()
  public customer_id: string;

  @column()
  public type: string;

  @column()
  public description: string;

  @column()
  public pay_cents_value: number;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public due_date: DateTime;

  @column()
  public paid_cents_value: number;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public paid_date: DateTime;

  @column()
  public notes: string;

  @column()
  public status: string;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;
}
