import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Payments extends BaseSchema {
  protected tableName = "payments";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
      table.uuid("order_id").references("id").inTable("orders").onDelete("CASCADE");
      table
        .uuid("customer_order_service_id")
        .references("id")
        .inTable("customer_order_service")
        .onDelete("CASCADE");
      table.uuid("customer_id").references("id").inTable("customers").onDelete("SET NULL");
      table.string("type", 50);
      table.string("description");
      table.integer("pay_cents_value");
      table.date("due_date");
      table.integer("paid_cents_value");
      table.date("paid_date");
      table.uuid("paid_by").references("id").inTable("users").onDelete("SET NULL");
      table.text("notes");
      table.string("status", 50);

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
