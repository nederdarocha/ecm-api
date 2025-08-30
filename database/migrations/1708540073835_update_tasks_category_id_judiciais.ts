import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  public async up() {
    /**
     * Update existing type_tasks to set category_id where category name is "Judiciais"
     */
    await this.db.rawQuery(
      "UPDATE type_tasks SET category_id = (SELECT id FROM categories WHERE name = 'Judiciais')"
    );
  }

  public async down() {
    // Nothing to do here
  }
}
