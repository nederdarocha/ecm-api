import { column, BaseModel } from "@ioc:Adonis/Lucid/Orm";

export default class Setting extends BaseModel {
  public static table = "settings";

  @column({ isPrimary: true })
  public tenant_id: string;

  @column()
  public spa_version: string;

  @column()
  public fl_maintenance: boolean;
}
