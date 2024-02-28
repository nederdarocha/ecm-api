import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "tasks";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("type_task_id").references("id").inTable("type_tasks").onDelete("SET NULL");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("type_task_id");
    });
  }
}
