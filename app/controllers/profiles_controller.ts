import Profile from '#models/profile'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfilesController {
  async show({ params, view }:HttpContext){
    const profile = await Profile.find(params.id)

    return view.render('pages/profile/show', { profile })
  }

  async edit({ params, view }: HttpContext){
    const profile = await Profile.find(params.id)

    return view.render('pages/profile/edit', { profile })
  }

  async update({ auth, params, request, response }:HttpContext){
    const profile = await Profile.findOrFail(params.id)

    if(profile.userId !== auth.user!.id){
      return response.unauthorized('Você não pode editar este perfil')
    }

    const payload = request.only(['bio', 'nick_name'])

    profile.merge(payload)
    await profile.save()

    return response.redirect().toRoute('profile.show', {id: params.id})
  }
}
