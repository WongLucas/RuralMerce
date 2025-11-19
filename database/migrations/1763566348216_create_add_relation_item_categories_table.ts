import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('items', (table) =>{
      table.integer('categories_id').unsigned().references('categories.id').onDelete('CASCADE')
    })
  }
}
