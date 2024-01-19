import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "tasks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").notNullable().index();
      table.uuid("order_id").references("id").inTable("orders").onDelete("SET NULL");
      table.uuid("customer_id").references("id").inTable("customers").onDelete("SET NULL");
      table.uuid("order_service_id").references("id").inTable("order_service").onDelete("CASCADE");
      table.text("description");
      table.text("notes");
      table.date("made_at");
      table.timestamp("make_in", { useTz: true });
      table.uuid("confirmed_by").references("id").inTable("users").onDelete("SET NULL");
      table.timestamp("confirmed_at", { useTz: true });
      table.boolean("is_schedule").defaultTo(false);
      table.string("status");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
