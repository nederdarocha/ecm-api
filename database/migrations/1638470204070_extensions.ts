import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ExtensionsSchema extends BaseSchema {
  public async up() {
    // uuid
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').knexQuery
    // unaccent
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "unaccent";').knexQuery
    // soundex
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";').knexQuery
  }

  public async down() {}
}
