import { DateTime } from "luxon";
import { column, BaseModel, hasMany, HasMany, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Address from "App/Modules/Addresses/Models/Address";
import User from "App/Modules/Users/Models/User";
import Item from "App/Modules/Items/Models/Item";

export default class Order extends BaseModel {
  public static table = "orders";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public number: string;

  @column()
  public customer_id: string;

  @column()
  public address_id?: string;

  @column()
  public amount_cents: number;

  @column()
  public price_cents_shipping: number | null;

  @column()
  public price_cents_discount: number | null;

  @column()
  public description: string | null;

  @column()
  public status?: string;

  @column.dateTime({
    autoCreate: true,
    serialize: (value?: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy hh:mm") : null;
    },
  })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => User, {
    foreignKey: "user_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof User>;

  @belongsTo(() => Address, {
    foreignKey: "address_id",
    localKey: "id",
  })
  public address: BelongsTo<typeof Address>;

  @hasMany(() => Item, {
    foreignKey: "order_id",
    localKey: "id",
  })
  public items: HasMany<typeof Item>;
}
