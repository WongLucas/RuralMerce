import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'
import CartItem from '#models/cart_item'

export default class CartsController {
  async add({ auth, params, response, session }: HttpContext){
    const user = auth.user!

    const productId = params.id
    await Product.findOrFail(productId)

    const cart = await user.related('cart').firstOrCreate({}, {
      userId: user.id
    })

    const existingItem = await cart.related('items')
      .query()
      .where('product_id', productId)
      .first()

    if(existingItem){
      existingItem.quantity += 1
      await existingItem.save()
    } else {
      await cart.related('items').create({
        productId: productId,
        quantity: 1
      })
    }

    session.flash('sucess', 'Item adicionado ao inventário!')

    return response.redirect().back()
  }

  async show({ auth, view}: HttpContext){
    const user = auth.user!

    const cart = await user.related('cart')
      .query()
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('product')
      })
      .first()

    let total = 0

    if (cart){
      cart.items.forEach(item => {
        total += item.product.price * item.quantity
      })
    }

    return view.render('pages/cart/show', { cart, total })
  }

  async update({ params, request, response }:HttpContext){
    const payload = request.only(['quantity'])
    const item = await CartItem.findOrFail(params.id)

    if(payload.quantity <= 0){
      await item.delete()
    } else {
      item.quantity = payload.quantity
      await item.save()
    }

    return response.redirect().back()
  }

  async remove({ params, response }: HttpContext){
    const item = await CartItem.findOrFail(params.id)
    await item.delete()

    return response.redirect().back()
  }
}
