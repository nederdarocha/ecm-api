import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Order from "App/Modules/Orders/Models/Order";
import CustomerOrderService from "App/Modules/Orders/Models/CustomerOrderService";
import User from "App/Modules/Users/Models/User";

export default class Task extends BaseModel {
  public static table = "tasks";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public order_id: string;

  @column()
  public customer_order_service_id: string;

  @column()
  public description: string;

  @column()
  public notes?: string | null;

  @column()
  public status: string;

  @column()
  public confirmed_by?: string | null;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy hh:mm:ss") : null;
    },
  })
  public confirmed_at?: DateTime | null;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public made_at: DateTime;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public make_in: DateTime;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => User, {
    foreignKey: "confirmed_by",
    localKey: "id",
  })
  public confirmedBy: BelongsTo<typeof User>;

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
