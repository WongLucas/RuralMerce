import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfilesController {
  async show({ params, view }:HttpContext){
    const user = await User.find(params.id)

    return view.render('pages/profile/show', { user })
  }
}
