import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Customer from "App/Modules/Customers/Models/Customer";
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
  public case: BelongsTo<typeof Order>;

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;
}
