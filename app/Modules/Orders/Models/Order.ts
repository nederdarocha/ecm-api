import { DateTime } from "luxon";
import {
  column,
  BaseModel,
  manyToMany,
  ManyToMany,
  belongsTo,
  BelongsTo,
} from "@ioc:Adonis/Lucid/Orm";
import Customer from "App/Modules/Customers/Models/Customer";
import Service from "App/Modules/Services/Models/Service";
import { be } from "date-fns/locale";
import Status from "./Status";

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
    pivotTable: "case_customer",
    pivotForeignKey: "customer_id",
    localKey: "id",
  })
  public customers: ManyToMany<typeof Customer>;

  @manyToMany(() => Service, {
    pivotTable: "case_service",
    pivotForeignKey: "service_id",
    localKey: "id",
  })
  public services: ManyToMany<typeof Service>;
}
