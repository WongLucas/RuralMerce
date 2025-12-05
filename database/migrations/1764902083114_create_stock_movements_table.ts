import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relacionamento com o Produto
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')

      // Quem fez a movimentação? (Opcional, mas recomendado)
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL')

      // Tipo: Entrada ou Saída
      table.enum('type', ['IN', 'OUT']).notNullable()

      // Quantidade movimentada
      table.integer('quantity').notNullable()

      // Motivo (ex: "Compra Fornecedor X", "Item quebrado")
      table.string('reason').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
