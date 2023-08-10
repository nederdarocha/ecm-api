import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Cache extends BaseSchema {
  protected tableName = "cache";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("key").unique();
      table.text("value");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
