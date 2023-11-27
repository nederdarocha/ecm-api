import { DateTime } from "luxon";
import {
  column,
  BaseModel,
  manyToMany,
  ManyToMany,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Customer from "App/Modules/Customers/Models/Customer";
import Status from "./Status";
import Service from "App/Modules/Services/Models/Service";
import OrderService from "./OrderService";

export default class Order extends BaseModel {
  public static table = "orders";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public order: number;

  @column()
  public number: string;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public started_at: DateTime;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public ended_at: DateTime;

  @column()
  public notes: string;

  @column()
  public status_id: string | null;

  @column()
  public user_id?: string;

  @column()
  public draft: boolean;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Status, {
    foreignKey: "status_id",
    localKey: "id",
  })
  public status: BelongsTo<typeof Status>;

  @manyToMany(() => Customer, {
    pivotTable: "customer_order",
    pivotForeignKey: "order_id",
    localKey: "id",
  })
  public customers: ManyToMany<typeof Customer>;

  @manyToMany(() => Service, {
    pivotTable: "order_service",
    pivotForeignKey: "order_id",
    localKey: "id",
  })
  public services: ManyToMany<typeof Service>;

  @hasMany(() => OrderService, {
    foreignKey: "order_id",
    localKey: "id",
  })
  public orderServices: HasMany<typeof OrderService>;
}
