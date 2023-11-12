import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class ExtensionsSchema extends BaseSchema {
  public async up() {
    await this.db.rawQuery("DROP TABLE IF EXISTS meta_data;").knexQuery;
  }

  public async down() {}
}
