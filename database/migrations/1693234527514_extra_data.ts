import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "extra_data";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").notNullable().index();
      table.uuid("service_id").references("id").inTable("services").onDelete("CASCADE");
      table.integer("order");
      table.string("label");
      table.string("name");
      table.string("type");
      table.string("options");
      table.integer("decimal_places").defaultTo(0);
      table.string("style");
      table.string("placeholder");
      table.boolean("status").defaultTo(true);

      table.unique(["name", "service_id"]);

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
