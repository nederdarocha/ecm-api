import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Products extends BaseSchema {
  protected tableName = "products";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("group_id").references("id").inTable("groups").onDelete("SET NULL");
      table.integer("order").nullable();
      table.string("slug", 255).notNullable();
      table.string("name", 255).notNullable();
      table.text("description").nullable();
      table.string("cover", 255).nullable();
      table.string("measured", 255).nullable();
      table.integer("price_cents").nullable();
      table.integer("price_cents_discount").nullable();
      table.integer("quantity_min").nullable();
      table.integer("increase").nullable();
      table.integer("quantity_max").nullable();
      table.boolean("highlight").defaultTo(false);
      table.boolean("available").defaultTo(true);
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
