import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "settings";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("tenant_id").primary().references("id").inTable("tenants").onDelete("CASCADE");

      table.string("spa_version").defaultTo("0.0.1");
      table.boolean("fl_maintenance").defaultTo(false);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
