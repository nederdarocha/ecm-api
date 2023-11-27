import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class AlterOrders extends BaseSchema {
  protected tableName = "customers";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean("retired").defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("retired");
    });
  }
}
