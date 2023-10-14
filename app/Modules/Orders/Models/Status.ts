import { DateTime } from "luxon";
import { column, BaseModel, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Order from "App/Modules/Orders/Models/Order";

export default class Status extends BaseModel {
  public static table = "status";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public name: string;

  @column()
  public user_id: string;

  @column()
  public initial: boolean;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @hasMany(() => Order, {
    foreignKey: "status_id",
    localKey: "id",
  })
  public customerOrderService: HasMany<typeof Order>;
}
