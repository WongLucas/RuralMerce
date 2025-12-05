import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'

import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class ProductsController {
  public async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const filterType = request.input('type', 'All')

    const query = Product.query().preload('images').orderBy('created_at', 'desc')

    if (filterType && filterType !== 'All') {
      query.where('type', filterType)
    }

    // .paginate(page, limit) retorna um objeto com meta-dados (total, lastPage, etc)
    const products = await query.paginate(page, limit)

    // Configura a URL base para os links de paginação manterem o filtro atual
    products.baseUrl('/products')
    products.queryString({ type: filterType })

    // Se for AJAX, retorna o partial da tabela completa (com paginação)
    if (request.header('X-Requested-With') === 'XMLHttpRequest') {
      return view.render('components/layout/partials/products_table', { products, filterType })
    }

    return view.render('pages/products/index', { products, filterType })
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
