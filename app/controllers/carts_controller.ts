import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Product from '#models/product'
import CartItem from '#models/cart_item'
import Cart from '#models/cart'

export default class CartsController {

  // --- ADICIONAR ITEM ---
  public async add({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const productId = params.id

    // Otimização: Buscamos Produto e Carrinho em paralelo para economizar tempo
    const [product, cart] = await Promise.all([
      Product.find(productId),
      user.related('cart').firstOrCreate({}, { userId: user.id })
    ])

    if (!product) {
      session.flash('notification', { type: 'error', message: 'Produto não encontrado.' })
      return response.redirect().back()
    }

    if (product.stock <= 0) {
      session.flash('notification', { type: 'error', message: 'Produto esgotado!' })
      return response.redirect().back()
    }

    // Busca apenas o item específico (Query leve)
    const existingItem = await cart.related('items')
      .query()
      .where('product_id', productId)
      .first()

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        session.flash('notification', { type: 'error', message: 'Limite de estoque atingido.' })
        return response.redirect().back()
      }
      existingItem.quantity += 1
      await existingItem.save()
    } else {
      await cart.related('items').create({
        productId: productId,
        quantity: 1
      })
    }

    return response.redirect().toRoute('cart.show')
  }

  // --- EXIBIR CARRINHO ---
  public async show({ auth, view }: HttpContext) {
    const user = auth.user!

    // Otimização: Preload recursivo otimizado
    const cart = await user.related('cart')
      .query()
      .preload('items', (itemsQuery) => {
        itemsQuery.orderBy('created_at', 'asc')
        // Preload apenas das colunas necessárias do produto e imagens melhora performance se a tabela for gigante
        itemsQuery.preload('product', (prodQuery) => {
          prodQuery.preload('images')
        })
      })
      .first()

    // Cálculo em memória (Node.js é muito rápido nisso, não precisa mudar)
    let total = 0
    if (cart) {
      cart.items.forEach(item => {
        if(item.product) {
            total += item.product.price * item.quantity
        }
      })
    }

    return view.render('pages/cart/show', { cart, total: total.toFixed(2) })
  }

  // --- ATUALIZAR QUANTIDADE ---
  public async update({ auth, params, request, response, session }: HttpContext) {
    const payload = request.only(['quantity'])
    const quantity = parseInt(payload.quantity)
    const user = auth.user!

    // Otimização: Query direta no CartItem com Join implícito (mais rápido que buscar cart depois item)
    // Buscamos o item que pertence a um carrinho que pertence ao usuário
    const item = await CartItem.query()
      .where('id', params.id)
      .whereHas('cart', (cartQuery) => {
        cartQuery.where('user_id', user.id)
      })
      .preload('product') // Já traz o produto para checar estoque
      .first()

    if (!item) return response.redirect().back()

    if (quantity <= 0) {
      await item.delete()
      return response.redirect().back()
    }

    if (quantity > item.product.stock) {
      session.flash('notification', { type: 'error', message: `Máximo disponível: ${item.product.stock}` })
      return response.redirect().back()
    }

    item.quantity = quantity
    await item.save()

    return response.redirect().back()
  }

  // --- REMOVER ITEM ---
  public async remove({ auth, params, response }: HttpContext) {
    const user = auth.user!

    // Otimização: Delete direto com verificação de segurança em uma única query
    await CartItem.query()
        .where('id', params.id)
        .whereHas('cart', (q) => q.where('user_id', user.id))
        .delete()

    // O delete() não falha se não achar, então não precisamos de ifs complexos
    return response.redirect().back()
  }

  async checkout({ auth, response, session }: HttpContext) {
    const user = auth.user!
    const trx = await db.transaction()

    try {
      const cart = await Cart.query({ client: trx })
        .where('userId', user.id)
        .preload('items')
        .first()

      if (cart && cart.items.length > 0) {

        for (const item of cart.items) {
          await Product.query({ client: trx }) // Passa trx aqui também
            .where('id', item.productId)
            .decrement('stock', item.quantity)
        }

        // 3. Limpeza do carrinho
        await CartItem.query({ client: trx }) // E aqui também
          .where('cartId', cart.id)
          .delete()
      }

      await trx.commit()

      session.flash('success', 'Compra realizada!')
      return response.redirect().toRoute('product.index')

    } catch (error) {
      await trx.rollback()
      session.flash('notification', { type: 'error', message: 'Erro ao finalizar.' })
      return response.redirect().back()
    }
  }
}
