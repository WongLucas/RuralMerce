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

  async edit({ params, view }: HttpContext){
    const item = await Item.find(params.id)
    console.log(item)

    return view.render('pages/items/edit', {item})
  }

  async update({ params, request, response }:HttpContext){
    const item = await Item.findOrFail(params.id)
    const payload = await request.only(['name', 'description'])

    item.merge(payload)
    await item.save()

    return response.redirect().toRoute('item.show', {id: params.id})
  }

  async destroy({ params, response }:HttpContext){
    const item = await Item.findOrFail(params.id)
    await item.delete()

    return response.redirect().toRoute('item.index')
  }
}
