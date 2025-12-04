import { DateTime } from 'luxon'
import { BaseModel, column, beforeDelete } from '@adonisjs/lucid/orm'

import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ProductImage from '#models/product_image'

import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare price: number

  @column()
  declare stock: number

  @column()
  declare image_url: string | null

  @hasMany(() => ProductImage)
  declare images: HasMany<typeof ProductImage>

  @beforeDelete()
  static async deleteAttachedFiles(product: Product) {
    // Carrega as imagens do produto que está sendo deletado
    await product.load('images')

    for (const image of product.images) {
      const filePath = app.makePath('public/uploads', image.path)
      try {
        await fs.unlink(filePath)
      } catch (error) {
        // Ignora erro se arquivo não existir
      }
    }
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
