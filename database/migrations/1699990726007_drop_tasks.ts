import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class ExtensionsSchema extends BaseSchema {
  public async up() {
    await this.db.rawQuery("DROP TABLE IF EXISTS tasks;").knexQuery;
  }

  public async down() {}
}
