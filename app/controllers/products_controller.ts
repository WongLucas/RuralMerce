import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'

export default class ProductsController {
  async index({ view }: HttpContext) {
    const products = await Product.all()
    return view.render('pages/products/index', {products})
  }
  async create({ view }: HttpContext) {
    return view.render('pages/products/create')
  }
  async store({ request, response }: HttpContext) {
    const payload = request.only(['name', 'description', 'price', 'stock', 'image_url'])

    const product = await Product.create(payload)

    return response.redirect().toRoute('product.show', {id: product.id})
  }
  async show({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    return view.render('pages/products/show', {product})
  }
  async edit({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    return view.render('pages/products/edit', { product })
  }
  async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const payload = request.only(['name', 'description', 'price', 'stock', 'image_url'])

    product.merge(payload)
    await product.save()

    return response.redirect().toRoute('product.show', {id: product.id})
  }
  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    product.delete()

    return response.redirect().toRoute('product.index')
  }
}
