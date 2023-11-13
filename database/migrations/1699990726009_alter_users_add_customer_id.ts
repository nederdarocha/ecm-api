import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class ItemRomaneios extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("customer_id").references("id").inTable("customers").onDelete("SET NULL");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("customer_id");
    });
  }
}
