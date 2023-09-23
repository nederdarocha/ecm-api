import { DateTime } from "luxon";
import { column, BaseModel, belongsTo, BelongsTo, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import User from "App/Modules/Users/Models/User";
import Address from "App/Modules/Addresses/Models/Address";

export default class Customer extends BaseModel {
  public static table = "customers";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public name: string;

  @column()
  public email: string;

  @column()
  public phone: string;

  @column()
  public document: string;

  @column()
  public document_secondary?: string | null;

  @column()
  public issuing_agency?: string | null;

  @column()
  public profession?: string | null;

  @column()
  public natural: boolean;

  @column()
  public is_indicator: boolean;

  @column()
  public commission?: number | null;

  @column()
  public gender?: string | null;

  @column()
  public previdencia_id?: string | null;

  @column()
  public previdencia_password?: string | null;

  @column()
  public proderj_id?: string | null;

  @column()
  public proderj_password?: string | null;

  @column()
  public bank?: string | null;

  @column()
  public branch?: string | null;

  @column()
  public account_number?: string | null;

  @column()
  public pix_key?: string | null;

  @column()
  public notes?: string | null;

  @column()
  public indicated_id?: string | null;

  @column()
  public user_id: string;

  @column.date({
    serialize: (value?: DateTime) => {
      return value ? value.toFormat("dd/MM/yyyy") : null;
    },
  })
  public birthday?: DateTime | null;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Customer, {
    foreignKey: "indicated_id",
    localKey: "id",
  })
  public indicator: BelongsTo<typeof Customer>;

  @belongsTo(() => User, {
    foreignKey: "user_id",
    localKey: "id",
  })
  public created_by: BelongsTo<typeof User>;

  @hasMany(() => Address, {
    foreignKey: "owner_id",
    localKey: "id",
  })
  public addresses: HasMany<typeof Address>;
}
