import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ view }:HttpContext){
    return view.render('pages/session/create')
  }

  async store({ auth, request, response }:HttpContext){
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    response.redirect().toRoute('index')
  }

  async destroy({ auth, response }:HttpContext){
    await auth.use('web').logout()
    response.redirect().toRoute('index')
  }
}
