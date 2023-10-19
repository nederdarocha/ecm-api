import { DateTime } from "luxon";

import { column, BaseModel } from "@ioc:Adonis/Lucid/Orm";

export default class Tenant extends BaseModel {
  public static table = "tenants";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public url: string;

  @column()
  public status: boolean;

  @column()
  public user_id: string | null;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;
}
