import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class AlterOrders extends BaseSchema {
  protected tableName = "order_service";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string("defendant");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("defendant");
    });
  }
}
