import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Orders extends BaseSchema {
  protected tableName = "orders";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.string("number").nullable().unique().index();
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table
        .uuid("address_id")
        .references("id")
        .inTable("addresses")
        .onDelete("SET NULL")
        .nullable();
      table.integer("amount_cents").nullable();
      table.integer("price_cents_discount").nullable();
      table.integer("price_cents_shipping").nullable();
      table.text("description");
      table.string("status", 100).nullable();

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
