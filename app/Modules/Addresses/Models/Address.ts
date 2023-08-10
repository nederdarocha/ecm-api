import { DateTime } from "luxon";
import { column, BaseModel } from "@ioc:Adonis/Lucid/Orm";

export default class Address extends BaseModel {
  public static table = "addresses";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public name: string;

  @column()
  public zip: string;

  @column()
  public commercial: boolean;

  @column()
  public favorite: boolean;

  @column()
  public street?: string;

  @column()
  public number?: string;

  @column()
  public complement?: string;

  @column()
  public neighborhood?: string;

  @column()
  public city?: string;

  @column()
  public state?: string;

  @column()
  public country?: string;

  @column()
  public reference?: string;

  @column()
  public latitude?: number;

  @column()
  public longitude?: number;

  @column()
  public user_id?: string;

  @column()
  public owner_id?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;
}
