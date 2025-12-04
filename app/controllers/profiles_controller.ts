import Profile from '#models/profile'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class ProfilesController {
  async show({ params, view }:HttpContext){
    const profile = await Profile.find(params.id)

    return view.render('pages/profile/show', { profile })
  }

  async edit({ params, view }: HttpContext){
    const profile = await Profile.find(params.id)

    return view.render('pages/profile/edit', { profile })
  }

  async update({ auth, params, request, response, session }: HttpContext){
    const profile = await Profile.findOrFail(params.id)

    if(profile.userId !== auth.user!.id){
      return response.unauthorized('Você não pode editar este perfil')
    }

    // 1. Recebe os dados de texto
    const payload = request.only(['bio', 'nick_name'])

    // 2. Recebe o arquivo (imagem)
    const avatar = request.file('avatar', {
      size: '2mb', // Limite de tamanho
      extnames: ['jpg', 'png', 'jpeg', 'webp'] // Extensões permitidas
    })

    // 3. Verifica se o usuário enviou uma imagem
    if (avatar) {
      // Se a imagem não for válida (ex: muito grande ou extensão errada)
      if (!avatar.isValid) {
        session.flash('errors', { avatar: avatar.errors })
        return response.redirect().back()
      }

      // Move a imagem para a pasta public/uploads
      await avatar.move(app.makePath('public/uploads'), {
        name: `${cuid()}.${avatar.extname}` // Gera um nome único: ckasd123.jpg
      })

      // Salva o nome do arquivo no objeto profile
      profile.avatar = avatar.fileName ?? null
    }

    // Mescla os dados de texto e salva
    profile.merge(payload)
    await profile.save()

    return response.redirect().toRoute('profile.show', {id: params.id})
  }
}
