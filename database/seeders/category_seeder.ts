import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    await Promise.all([
      Category.firstOrCreate({ name: 'TDC'}),
      Category.firstOrCreate({ name: 'Redondo'}),
      Category.firstOrCreate({ name: 'Espiral'}),
      Category.firstOrCreate({ name: 'Peça'}),
    ])
  }
}
