import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Permissions extends BaseSchema {
  protected tableName = "permissions";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.string("name", 100);
      table.string("slug", 100).notNullable().unique().index();
      table.boolean("c").defaultTo(false);
      table.boolean("r").defaultTo(false);
      table.boolean("u").defaultTo(false);
      table.boolean("d").defaultTo(false);
      table.string("description").nullable();

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
