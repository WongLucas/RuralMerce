import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminAuthMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {

    const user = auth.user

    if (!user || !user.isAdmin) {

      session.flash('errors', { loginError: 'Acesso negado. Área restrita a administradores.' })
      return response.redirect().toRoute('product.index') // Ou login
    }

    // 3. Se for Admin, deixa passar
    const output = await next()
    return output
  }
}
