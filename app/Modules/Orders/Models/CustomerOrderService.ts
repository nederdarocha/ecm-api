import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Service from "App/Modules/Services/Models/Service";
import CustomerOrder from "./CustomerOrder";
import Court from "App/Modules/Courts/Models/Courts";
import Customer from "App/Modules/Customers/Models/Customer";
import Order from "./Order";

export default class CustomerServiceService extends BaseModel {
  public static table = "customer_order_service";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public order_id: string;

  @column()
  public customer_id: string;

  @column()
  public customer_order_id: string;

  @column()
  public service_id: string;

  @column()
  public court_id: string | null;

  @column()
  public court_number: string | null;

  @column()
  public honorary_type: string;

  @column()
  public honorary_cents_value: number | null;

  @column()
  public service_cents_amount: number | null;

  @column()
  public user_id?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Order, {
    foreignKey: "order_id",
    localKey: "id",
  })
  public order: BelongsTo<typeof Order>;

  @belongsTo(() => Service, {
    foreignKey: "service_id",
    localKey: "id",
  })
  public service: BelongsTo<typeof Service>;

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;

  @belongsTo(() => Court, {
    foreignKey: "court_id",
    localKey: "id",
  })
  public court: BelongsTo<typeof Court>;

  @belongsTo(() => CustomerOrder, {
    foreignKey: "customer_order_id",
    localKey: "id",
  })
  public case_customer: BelongsTo<typeof CustomerOrder>;
}
