import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "case_customer";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table
        .uuid("tenant_id")
        .references("id")
        .inTable("tenants")
        .notNullable()
        .index()
        .onDelete("CASCADE");
      table.uuid("case_id").references("id").inTable("cases").onDelete("CASCADE");
      table.uuid("customer_id").references("id").inTable("customers").onDelete("CASCADE");

      table.unique(["case_id", "customer_id", "tenant_id"]);

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
