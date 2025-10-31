import type { HttpContext } from '@adonisjs/core/http'
//import vine, { errors } from '@vinejs/vine'

import {createItemValidator} from '#validators/item'

import Item from '#models/item'
import Category from '#models/category'

export default class ItemsController {
  async index({ auth, view }: HttpContext) {
    const items = await Item.all()
    return view.render('pages/items/index', {items})
  }

  async create({ view }: HttpContext) {
    const categories = await Category.all()
    return view.render('pages/items/create', {categories})
  }

  async show({ params, view }: HttpContext){
    const item = await Item.find( params.id )
    return view.render('pages/items/show', {item})
  }

  async store({ request, response }: HttpContext){
    const payload = await request.validateUsing(createItemValidator)

    const item = await Item.create({
      name: payload.name,
      description: payload.description,
    })

    if(payload.categories && payload.categories.length > 0){
      await item.related('categories').attach(payload.categories)
    }

    return response.redirect().toRoute('item.show', {id: item.id })
  }

  async edit({ params, view }: HttpContext){
    const item = await Item.query().where('id', params.id).preload('categories').firstOrFail()
    const categories = await Category.all()

    return view.render('pages/items/edit', {item, categories})
  }

  async update({ params, request, response }:HttpContext){
    const item = await Item.findOrFail(params.id)
    const payload = await request.only(['name', 'description'])
    const categoryIds = request.input('categories', [])

    item.merge(payload)
    await item.save()

    await item.related('categories').sync(categoryIds)

    return response.redirect().toRoute('item.show', {id: params.id})
  }

  async destroy({ params, response }:HttpContext){
    const item = await Item.findOrFail(params.id)
    await item.delete()

    return response.redirect().toRoute('item.index')
  }
}
