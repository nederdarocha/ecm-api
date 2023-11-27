import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class AlterOrders extends BaseSchema {
  protected tableName = "orders";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean("draft").defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("draft");
    });
  }
}
