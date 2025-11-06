import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Item from '#models/item'
import itemsData from '../../items.json' with { type: 'json' }

export default class ItemSeeder extends BaseSeeder {
  async run() {
    const items = itemsData.map((item: any) => ({
      name: item.Name || item.name,
      description: item.Description || item.description,
    }))

    await Item.createMany(items)
  }
}
