import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Order from "App/Modules/Orders/Models/Order";
import User from "App/Modules/Users/Models/User";
import Customer from "App/Modules/Customers/Models/Customer";

export default class Message extends BaseModel {
  public static table = "messages";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public order_id: string;

  @column()
  public customer_id: string;

  @column()
  public message: string;

  @column()
  public channel: string;

  @column()
  public direction: string;

  @column()
  public status: string;

  @column()
  public user_id: string;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public made_at: DateTime;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => User, {
    foreignKey: "user_id",
    localKey: "id",
  })
  public user: BelongsTo<typeof User>;

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;

  @belongsTo(() => Order, {
    foreignKey: "order_id",
    localKey: "id",
  })
  public order: BelongsTo<typeof Order>;
}
