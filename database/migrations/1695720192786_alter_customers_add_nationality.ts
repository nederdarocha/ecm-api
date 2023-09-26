import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "customers";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string("nationality");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("nationality");
    });
  }
}
