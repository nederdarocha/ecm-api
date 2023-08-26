import { DateTime } from "luxon";
import { BaseModel, column, ManyToMany, manyToMany } from "@ioc:Adonis/Lucid/Orm";
import Role from "./Role";

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column()
  public description?: string;

  @column()
  public c: boolean;

  @column()
  public r: boolean;

  @column()
  public u: boolean;

  @column()
  public d: boolean;

  @manyToMany(() => Role, {
    pivotTable: "permission_role",
    pivotForeignKey: "permission_id",
    localKey: "id",
  })
  public roles: ManyToMany<typeof Role>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
