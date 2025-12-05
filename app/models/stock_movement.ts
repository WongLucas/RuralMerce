// app/Models/StockMovement.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, afterCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import User from '#models/user'

export default class StockMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare userId: number | null

  @column()
  declare type: 'IN' | 'OUT'

  @column()
  declare quantity: number

  @column()
  declare reason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // --- A MÁGICA ACONTECE AQUI ---
  @afterCreate()
  static async updateProductStock(movement: StockMovement) {
    // 1. Busca o produto
    const product = await Product.findOrFail(movement.productId)

    // 2. Calcula
    if (movement.type === 'IN') {
      product.stock += movement.quantity
    } else {
      product.stock -= movement.quantity
    }

    // 3. Impede estoque negativo (Opcional, mas boa prática)
    if (product.stock < 0) product.stock = 0

    // 4. Salva o novo total no produto
    await product.save()
  }
}
