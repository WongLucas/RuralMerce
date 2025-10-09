import type { HttpContext } from '@adonisjs/core/http'
import Item from '#models/item'

export default class ItemsController {
  async index({}: HttpContext) {
    return 'Olha os itens ai'
  }

  async create({ view }: HttpContext) {
    return view.render('pages/product')
  }

  async show({ params }: HttpContext){
    const item = Item.find( params.id )
    return item
  }

  async store({}: HttpContext){
    return 'Oie, estamos criando seu item hihiihi'
  }

}
