import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Notifications extends BaseSchema {
  protected tableName = "notifications";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("from_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("to_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table.string("go_to");
      table.string("subject");
      table.text("message");
      table.string("channel");
      table.string("status").defaultTo("pending");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
