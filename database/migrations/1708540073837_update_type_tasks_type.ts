import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  public async up() {
    /**
     * Update existing type_tasks to set type = 'andamento'
     */
    await this.db.rawQuery("UPDATE type_tasks SET type = 'andamento'");
  }
}
