import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Addresses extends BaseSchema {
  protected tableName = "addresses";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").notNullable().index();
      table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
      table.uuid("owner_id").nullable();
      table.string("name");
      table.boolean("commercial").defaultTo(false);
      table.boolean("favorite").defaultTo(false);
      table.string("zip");
      table.string("street");
      table.string("number");
      table.string("complement");
      table.string("neighborhood");
      table.string("city");
      table.string("state");
      table.string("country");
      table.string("reference");
      table.decimal("latitude", 9, 6);
      table.decimal("longitude", 9, 6);

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
