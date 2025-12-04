import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'

import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class ProductsController {
  async index({ view }: HttpContext) {
    // PRELOAD: Carrega os produtos JÁ com as imagens para evitar queries extras
    const products = await Product.query().preload('images')
    return view.render('pages/products/index', { products })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/products/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = request.only(['name', 'description', 'price', 'stock', 'type'])
    const product = await Product.create(payload)

    const images = request.files('images', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    for (let image of images) {
      if (image.isValid) {
        const fileName = `${cuid()}.${image.extname}`

        await image.move(app.makePath('public/uploads'), { name: fileName })

        await product.related('images').create({
          path: fileName
        })
      }
    }

    return response.redirect().toRoute('product.show', { id: product.id })
  }

  async show({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.load('images')

    return view.render('pages/products/show', { product })
  }

async edit({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    // IMPORTANTE: Carregar as imagens para exibir na view de edição
    await product.load('images')

    return view.render('pages/products/edit', { product })
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const payload = request.only(['name', 'description', 'price', 'stock', 'type'])

    const images = request.files('images', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp']
    })

    if (images.length > 0) {
      for (let image of images) {
        if (image.isValid) {
          const fileName = `${cuid()}.${image.extname}`

          await image.move(app.makePath('public/uploads'), {
            name: fileName
          })

          await product.related('images').create({
            path: fileName
          })
        }
      }
    }

    product.merge(payload)
    await product.save()

    return response.redirect().toRoute('product.show', { id: product.id })
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    product.delete()

    return response.redirect().toRoute('product.index')
  }
}
