import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Customer from "App/Modules/Customers/Models/Customer";
import CustomerOrderService from "App/Modules/Orders/Models/CustomerOrderService";
import Order from "./Order";

export default class CustomerOrder extends BaseModel {
  public static table = "customer_order";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public order_id: string;

  @column()
  public customer_id: string;

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

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;

  @hasMany(() => CustomerOrderService, {
    foreignKey: "customer_order_id",
    localKey: "id",
  })
  public customerOrderServices: HasMany<typeof CustomerOrderService>;
}
