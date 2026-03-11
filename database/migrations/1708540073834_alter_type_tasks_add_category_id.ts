import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "type_tasks";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("category_id").references("id").inTable("categories").onDelete("SET NULL");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("category_id");
    });
  }
}
