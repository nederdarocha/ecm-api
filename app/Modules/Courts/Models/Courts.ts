import { DateTime } from "luxon";
import { column, BaseModel, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import CustomerOrderService from "App/Modules/Orders/Models/CustomerOrderService";

export default class Court extends BaseModel {
  public static table = "courts";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public name: string;

  @column()
  public initials: string;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @hasMany(() => CustomerOrderService, {
    foreignKey: "court_id",
    localKey: "id",
  })
  public customerOrderService: HasMany<typeof CustomerOrderService>;
}
