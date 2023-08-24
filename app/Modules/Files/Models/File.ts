import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column, computed } from "@ioc:Adonis/Lucid/Orm";
import Env from "@ioc:Adonis/Core/Env";
import User from "App/Modules/Users/Models/User";

export default class File extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public owner_id: string;

  @column()
  public name: string;

  @column()
  public key: string;

  @column()
  public url: string;

  @column()
  public description: string;

  @column()
  public type: string;

  @column()
  public content_type: string;

  @column()
  public is_public: boolean;

  @column()
  public order: number;

  @column()
  public size: number;

  @column()
  public user_id: string;

  @column.dateTime({
    autoCreate: true,
    serialize: (value?: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy hh:mm") : null;
    },
  })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @computed()
  public get url_download() {
    return `${Env.get("API_URL")}/files/download/${this.id}`;
  }

  @belongsTo(() => User, {
    foreignKey: "user_id",
    localKey: "id",
  })
  public user: BelongsTo<typeof User>;
}
