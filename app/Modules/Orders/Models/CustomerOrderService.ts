import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Service from "App/Modules/Services/Models/Service";
import CustomerOrder from "./CustomerOrder";

export default class CustomerService extends BaseModel {
  public static table = "customer_order_service";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public customer_order_id: string;

  @column()
  public service_id: string;

  @column()
  public service_amount: number;

  @column()
  public honorary_type: string;

  @column()
  public honorary_value: number;

  @column()
  public user_id?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Service, {
    foreignKey: "service_id",
    localKey: "id",
  })
  public service: BelongsTo<typeof Service>;

  @belongsTo(() => CustomerOrder, {
    foreignKey: "customer_order_id",
    localKey: "id",
  })
  public case_customer: BelongsTo<typeof CustomerOrder>;
}
