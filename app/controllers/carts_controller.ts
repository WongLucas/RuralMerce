import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import CartItem from '#models/cart_item'

export default class CartsController {

  // --- ADICIONAR ITEM ---
  public async add({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const productId = params.id

    // 1. Busca produto e verifica se existe
    const product = await Product.find(productId)
    if (!product) {
      session.flash('notification', { type: 'error', message: 'Produto não encontrado.' })
      return response.redirect().back()
    }

    // 2. BLINDAGEM: Verifica se tem estoque base
    if (product.stock <= 0) {
      session.flash('notification', { type: 'error', message: 'Produto esgotado!' })
      return response.redirect().back()
    }

    // 3. Busca ou cria o carrinho do usuário
    const cart = await user.related('cart').firstOrCreate({}, {
      userId: user.id
    })

    // 4. Verifica se o item já está no carrinho
    const existingItem = await cart.related('items')
      .query()
      .where('product_id', productId)
      .first()

    if (existingItem) {
      // 5. BLINDAGEM: Verifica se somando +1 vai estourar o estoque
      if (existingItem.quantity + 1 > product.stock) {
        session.flash('notification', { type: 'error', message: 'Você já atingiu o limite de estoque deste item.' })
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

    session.flash('notification', { type: 'success', message: 'Item adicionado ao baú!' })
    return response.redirect().toRoute('cart.show', {id: cart.id})
  }

  // --- EXIBIR CARRINHO ---
  public async show({ auth, view }: HttpContext) {
    const user = auth.user!

    // 1. Carrega carrinho com Itens -> Produto -> Imagens (Para mostrar a foto)
    const cart = await user.related('cart')
      .query()
      .preload('items', (itemsQuery) => {
        itemsQuery.orderBy('created_at', 'asc') // Itens na ordem que foram adicionados
        itemsQuery.preload('product', (prodQuery) => {
          prodQuery.preload('images')
        })
      })
      .first()

    // 2. Calcula total
    let total = 0
    if (cart) {
      cart.items.forEach(item => {
        // Proteção extra: se o produto foi deletado mas o item ficou no carrinho
        if(item.product) {
            total += item.product.price * item.quantity
        }
      })
    }

    // Formata para 2 casas decimais para evitar erros de ponto flutuante do JS
    const formattedTotal = total.toFixed(2)

    return view.render('pages/cart/show', { cart, total: formattedTotal })
  }

  // --- ATUALIZAR QUANTIDADE ---
  public async update({ auth, params, request, response, session }: HttpContext) {
    const payload = request.only(['quantity'])
    const quantity = parseInt(payload.quantity)

    // Busca o item garantindo que ele pertence ao carrinho do usuário (Segurança)
    // Isso impede que eu mude o ID na URL e altere o carrinho do vizinho
    const user = auth.user!
    const cart = await user.related('cart').query().first()

    if (!cart) return response.redirect().back()

    const item = await CartItem.query()
      .where('id', params.id)
      .where('cart_id', cart.id)
      .preload('product')
      .first()

    if (!item) {
        return response.redirect().back()
    }

    // 1. Se qtd <= 0, deleta
    if (quantity <= 0) {
      await item.delete()
      session.flash('notification', { type: 'success', message: 'Item removido.' })
      return response.redirect().back()
    }

    // 2. BLINDAGEM: Verifica estoque antes de aumentar
    if (quantity > item.product.stock) {
      session.flash('notification', {
        type: 'error',
        message: `Estoque insuficiente. Máximo disponível: ${item.product.stock}`
      })
      return response.redirect().back()
    }

    item.quantity = quantity
    await item.save()

    return response.redirect().back()
  }

  // --- REMOVER ITEM ---
  public async remove({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const cart = await user.related('cart').query().first()

    if (cart) {
        // Segurança: Garante que só remove se for do meu carrinho
        const item = await CartItem.query()
            .where('id', params.id)
            .where('cart_id', cart.id)
            .first()

        if (item) {
            await item.delete()
            session.flash('notification', { type: 'success', message: 'Item removido do baú.' })
        }
    }

    return response.redirect().back()
  }
}
