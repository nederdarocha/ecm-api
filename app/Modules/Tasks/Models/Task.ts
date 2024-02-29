import { DateTime } from "luxon";
import {
  column,
  BaseModel,
  belongsTo,
  BelongsTo,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Order from "App/Modules/Orders/Models/Order";
import OrderService from "App/Modules/Orders/Models/OrderService";
import User from "App/Modules/Users/Models/User";
import Customer from "App/Modules/Customers/Models/Customer";
import TypeTask from "./TypeTask";

export default class Task extends BaseModel {
  public static table = "tasks";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public type_task_id: string;

  @column()
  public order_id: string;

  @column()
  public customer_id: string;

  @column()
  public order_service_id: string;

  @column()
  public description: string;

  @column({
    serialize: (value: string) => {
      return value ? value : "";
    },
  })
  public notes?: string | null;

  @column()
  public status: string;

  @column()
  public confirmed_by?: string | null;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy HH:mm:ss") : null;
    },
  })
  public confirmed_at?: DateTime | null;

  @column.date({
    serialize: (value: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public made_at: DateTime;

  @column.dateTime()
  public make_in: DateTime | null;

  @column()
  public is_schedule: boolean;

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

  @belongsTo(() => Customer, {
    foreignKey: "customer_id",
    localKey: "id",
  })
  public customer: BelongsTo<typeof Customer>;

  @belongsTo(() => OrderService, {
    foreignKey: "order_service_id",
    localKey: "id",
  })
  public orderService: BelongsTo<typeof OrderService>;

  @belongsTo(() => TypeTask, {
    foreignKey: "type_task_id",
    localKey: "id",
  })
  public typeTask: BelongsTo<typeof TypeTask>;

  @manyToMany(() => User, {
    pivotTable: "task_user",
    localKey: "id",
  })
  public users: ManyToMany<typeof User>;
}
