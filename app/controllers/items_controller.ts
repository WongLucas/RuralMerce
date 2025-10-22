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

  async show({ params, view }: HttpContext){
    const item = await Item.find( params.id )
    return view.render('pages/items/show', {item})
  }

  async store({ request, response }: HttpContext){
    const payload = await request.all()

    const product = await Item.create({
      name: payload.name,
      description: payload.description
    })
    return response.redirect().toRoute('item.show', {id: product.id })
  }

}
