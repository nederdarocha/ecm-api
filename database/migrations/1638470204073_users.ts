import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class UsersSchema extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").notNullable().index();
      table.string("first_name", 180).nullable();
      table.string("last_name", 180).nullable();
      table.string("document", 50).nullable().index();
      table.string("email", 255).nullable().index();
      table.string("phone", 50).nullable().index();
      table.string("password", 180).notNullable();
      table.string("salt").nullable();
      table.string("avatar", 255).nullable();
      table.boolean("status").defaultTo(true);
      table.string("access_token").nullable();

      table.unique(["email", "tenant_id"]);
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true }).notNullable();
      table.timestamp("updated_at", { useTz: true }).notNullable();
      table.uuid("user_id").nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
