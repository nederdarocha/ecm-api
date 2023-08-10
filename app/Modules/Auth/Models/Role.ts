import { DateTime } from "luxon";
import { BaseModel, column, ManyToMany, manyToMany } from "@ioc:Adonis/Lucid/Orm";
import Permission from "./Permission";

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column()
  public description?: string;

  @manyToMany(() => Permission, {
    pivotTable: "permission_role",
    pivotForeignKey: "role_id",
    localKey: "id",
  })
  public permissions: ManyToMany<typeof Permission>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
