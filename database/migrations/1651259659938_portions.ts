import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Products extends BaseSchema {
  protected tableName = "portions";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("product_id").references("id").inTable("products").onDelete("CASCADE");
      table.integer("order").nullable();
      table.string("name", 255).notNullable();
      table.integer("price_cents").nullable();
      table.boolean("default").defaultTo(false);
      table.boolean("status").defaultTo(true);

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
