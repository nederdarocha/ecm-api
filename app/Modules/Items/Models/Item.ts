import { DateTime } from "luxon";

import { column, BaseModel, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Product from "App/Modules/Products/Models/Product";
import Customer from "App/Modules/Customers/Models/Customer";
import Packing from "App/Modules/Packings/Models/Packing";
import Cut from "App/Modules/Cuts/Models/Cut";
import Portion from "App/Modules/Portions/Models/Portion";
import Order from "App/Modules/Orders/Models/Order";

export default class Item extends BaseModel {
  public static table = "items";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public order_id: string;

  @column()
  public customer_id: string;

  @column()
  public product_id: string;

  @column()
  public packing_id: string;

  @column()
  public cut_id: string;

  @column()
  public portion_id: string;

  @column()
  public quantity: number;

  @column()
  public measured: string;

  @column()
  public price_cents: number;

  @column()
  public price_cents_discount: number | null;

  @column()
  public price_cents_packing: number | null;

  @column()
  public price_cents_portion: number | null;

  @column()
  public amount_cents: number;

  @column()
  public description?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @hasOne(() => Order, {
    foreignKey: "id",
    localKey: "order_id",
  })
  public order: HasOne<typeof Order>;

  @hasOne(() => Customer, {
    foreignKey: "id",
    localKey: "customer_id",
  })
  public customer: HasOne<typeof Customer>;

  @hasOne(() => Product, {
    foreignKey: "id",
    localKey: "product_id",
  })
  public product: HasOne<typeof Product>;

  @hasOne(() => Packing, {
    foreignKey: "id",
    localKey: "packing_id",
  })
  public packing: HasOne<typeof Packing>;

  @hasOne(() => Cut, {
    foreignKey: "id",
    localKey: "cut_id",
  })
  public cut: HasOne<typeof Cut>;

  @hasOne(() => Portion, {
    foreignKey: "id",
    localKey: "portion_id",
  })
  public portion: HasOne<typeof Portion>;
}
