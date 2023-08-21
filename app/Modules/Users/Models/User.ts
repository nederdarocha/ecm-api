import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
  computed,
} from "@ioc:Adonis/Lucid/Orm";
import Role from "App/Modules/Auth/Models/Role";
import UserToken from "./UserToken";
import Permission from "App/Modules/Auth/Models/Permission";

export default class User extends BaseModel {
  public static table = "users";

  @column({ isPrimary: true })
  public id: string;

  @column()
  public tenant_id: string;

  @column()
  public first_name: string;

  @column()
  public last_name: string;

  @column()
  public document?: string;

  @column()
  public email: string;

  @column()
  public phone: string;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: null })
  public salt: string;

  @column()
  public avatar: string;

  @column()
  public status: boolean;

  @computed()
  public get name() {
    return `${this.first_name} ${this.last_name}`;
  }

  @column({ serializeAs: null })
  public access_token: string;

  @column()
  public user_id: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(users: User) {
    if (users.$dirty.password) {
      users.password = await Hash.make(`${users.password}${users.salt}`);
    }
  }

  @manyToMany(() => Role, {
    pivotTable: "role_user",
    pivotTimestamps: true,
  })
  public roles: ManyToMany<typeof Role>;

  @manyToMany(() => Permission, {
    pivotTable: "permission_user",
    pivotTimestamps: true,
  })
  public permissions: ManyToMany<typeof Permission>;

  @hasMany(() => UserToken, {
    foreignKey: "user_id",
    localKey: "id",
  })
  public tokens: HasMany<typeof UserToken>;
}
