import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Images extends BaseSchema {
  protected tableName = "images";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("owner_id").nullable();
      table.integer("order").defaultTo(1).index();
      table.string("name", 255).nullable();
      table.boolean("favorite").defaultTo(false);
      table.string("key", 255).nullable();
      table.string("url", 255).nullable();
      table.text("description").nullable();
      table.string("content_type", 255).nullable();
      table.boolean("is_public").defaultTo(true);

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
