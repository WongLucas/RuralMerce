import Category from '#models/category'
import Item from '#models/item'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  async store({ request }:HttpContext){
    const payload = request.all()
    const category = Category.create({
      name: payload.name
    })
  }
  async create({}:HttpContext){
    await Item.create({name: 'nome', description: 'Oloquinho'})
    await Category.createMany([{name: 'haha'},{name: 'hihi'},{name: 'huhu'}])
  }
  async gay({}:HttpContext){
    const item = await Item.findOrFail(1)
    await item.related('categories').attach([1,2,3])

  }
}
