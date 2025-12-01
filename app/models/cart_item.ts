import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Cart from '#models/cart'
import Product from '#models/product'

export default class CartItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cartId: number

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @belongsTo(() => Cart)
  declare cart: BelongsTo<typeof Cart>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
