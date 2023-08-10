import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Items extends BaseSchema {
  protected tableName = "items";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("order_id").references("id").inTable("orders").onDelete("CASCADE");
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("product_id").references("id").inTable("products").onDelete("SET NULL");
      table.uuid("packing_id").references("id").inTable("packings").onDelete("SET NULL");
      table.uuid("cut_id").references("id").inTable("cuts").onDelete("SET NULL");
      table.uuid("portion_id").references("id").inTable("portions").onDelete("SET NULL");
      table.integer("quantity");
      table.string("measured");
      table.integer("price_cents");
      table.integer("price_cents_discount");
      table.integer("price_cents_packing");
      table.integer("price_cents_portion");
      table.integer("amount_cents");
      table.text("description");
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
