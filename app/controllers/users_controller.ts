import type { HttpContext } from '@adonisjs/core/http'

import { createUserValidator } from '#validators/user'
import User from '#models/user'

export default class UsersController {
  async create({ view }:HttpContext){
    return view.render('pages/users/create')
  }

  async store({ auth, response, request }:HttpContext){
    const payload = await request.validateUsing(createUserValidator)
    //const payload = await request.body()
    const user = await User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password
    })

    await auth.use('web').login(user)

    return response.redirect().toRoute('profile.show', {id: user.id})
  }
}
