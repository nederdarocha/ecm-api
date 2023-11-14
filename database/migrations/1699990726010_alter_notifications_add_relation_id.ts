import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class ItemRomaneios extends BaseSchema {
  protected tableName = "notifications";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("relation_id").index();
      table.timestamp("read_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("relation_id");
      table.dropColumn("read_at");
    });
  }
}
