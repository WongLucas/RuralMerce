import type { HttpContext } from '@adonisjs/core/http'
import Item from '#models/item'

export default class ItemsController {
  async index({ view }: HttpContext) {
    const items = await Item.all()
    return view.render('pages/items/index', {items})
  }

  async create({ view }: HttpContext) {
    return view.render('pages/items/create')
  }

  async show({ params }: HttpContext){
    const item = Item.find( params.id )
    return item
  }

  async store({ request }: HttpContext){
    const payload = await request.all()

    const product = Item.create({
      name: payload.name,
      description: payload.description
    })
    return product
  }

}
