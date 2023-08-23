import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class People extends BaseSchema {
  protected tableName = "customers";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary().defaultTo(this.db.rawQuery("uuid_generate_v4()").knexQuery);
      table.uuid("tenant_id").references("id").inTable("tenants").notNullable().index();
      table.uuid("indicated_id").references("id").inTable("customers").index().onDelete("SET NULL");

      table.string("name").index();
      table.string("email");
      table.string("phone");
      table.string("document", 50).index();
      table.string("document_secondary", 50);
      table.boolean("natural").defaultTo(true);
      table.string("gender");
      table.string("bank");
      table.string("branch", 50);
      table.string("account_number", 50);
      table.string("pix_key");
      table.text("notes");

      table.unique(["document", "tenant_id"]);

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
