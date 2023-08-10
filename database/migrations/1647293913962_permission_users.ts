import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class RoleUsers extends BaseSchema {
  protected tableName = "permission_user";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);

      table.uuid("permission_id").references("id").inTable("permissions").onDelete("CASCADE");
      table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");

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
