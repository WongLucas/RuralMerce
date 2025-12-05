// app/Controllers/Http/StockMovementsController.ts
import type { HttpContext } from '@adonisjs/core/http'
import StockMovement from '#models/stock_movement'
import Product from '#models/product'

export default class StockMovementsController {

  public async store({ request, response, auth, params }: HttpContext) {
    // 1. Validação simples
    const payload = request.only(['type', 'quantity', 'reason'])
    const productId = params.product_id

    // Verifica se o produto existe
    await Product.findOrFail(productId)

    // 2. Cria a movimentação
    // O Hook @afterCreate no Model vai atualizar o estoque do produto sozinho!
    await StockMovement.create({
      productId: productId,
      userId: auth.user?.id, // Pega o admin logado
      type: payload.type,
      quantity: Number(payload.quantity),
      reason: payload.reason
    })

    // 3. Feedback e Redirecionamento
    // (Se quiser, pode usar flash messages aqui)
    return response.redirect().toRoute('product.show', { id: productId })
  }
}
