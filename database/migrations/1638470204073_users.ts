import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class UsersSchema extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.string("name", 180).nullable();
      table.string("document", 50).nullable().index();
      table.string("email", 255).nullable().index();
      table.string("phone", 50).nullable().index();
      table.string("password", 180).notNullable();
      table.integer("salt").nullable();
      table.string("avatar", 255).nullable();
      table.boolean("status").defaultTo(true);
      table.string("access_token").nullable();
      table.uuid("user_id").nullable();
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true }).notNullable();
      table.timestamp("updated_at", { useTz: true }).notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
