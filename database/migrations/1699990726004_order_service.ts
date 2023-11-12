import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "order_service";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").notNullable().index();
      table.uuid("order_id").references("id").inTable("orders").onDelete("CASCADE");
      table.uuid("service_id").references("id").inTable("services").onDelete("CASCADE");
      table.uuid("court_id").references("id").inTable("courts").onDelete("SET NULL");
      table.string("court_number");
      table.string("honorary_type");
      table.integer("honorary_cents_value");
      table.integer("service_cents_amount");
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
