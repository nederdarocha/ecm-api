import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Image extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public user_id: string;

  @column()
  public owner_id: string;

  @column()
  public order: number;

  @column()
  public name: string;

  @column()
  public favorite: boolean;

  @column()
  public key: string;

  @column()
  public url: string;

  @column()
  public description: string;

  @column()
  public content_type: string;

  @column()
  public is_public: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
