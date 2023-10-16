import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Customer from "App/Modules/Customers/Models/Customer";
import Order from "App/Modules/Orders/Models/Order";
import CustomerOrderService from "App/Modules/Orders/Models/CustomerOrderService";
import User from "App/Modules/Users/Models/User";

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
  public paid_by: string;

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

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;

  @belongsTo(() => User, {
    foreignKey: "paid_by",
    localKey: "id",
  })
  public paidBy: BelongsTo<typeof User>;

  @belongsTo(() => Order, {
    foreignKey: "order_id",
    localKey: "id",
  })
  public order: BelongsTo<typeof Order>;

  @belongsTo(() => CustomerOrderService, {
    foreignKey: "customer_order_service_id",
    localKey: "id",
  })
  public customerOrderService: BelongsTo<typeof CustomerOrderService>;
}
