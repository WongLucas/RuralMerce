import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'


export default class SessionController {
  async create({ view }:HttpContext){
    return view.render('pages/session/create')
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)

      await auth.use('web').login(user)

      return response.redirect().toRoute('profile.show', { id: user.id })

    } catch (error) {
      if (error.code !== 'E_INVALID_CREDENTIALS') {
        throw error
      }

      session.flash('loginError', 'Credenciais inválidas. Verifique seu email e senha.')
      return response.redirect().back()
    }
  }

  async destroy({ auth, response }:HttpContext){
    await auth.use('web').logout()
    response.redirect().toRoute('index')
  }
}
