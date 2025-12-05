import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'

export default class extends BaseSeeder {
  async run() {
    const filePath = app.makePath('isaac_items_full.json')

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const items = JSON.parse(fileContent)

      console.log(`📦 Iniciando importação de ${items.length} itens...`)

      for (const item of items) {

        // 1. Cria ou Atualiza o Produto
        const product = await Product.updateOrCreate(
          { name: item.Name },
          {
            description: item.Description || item.Effect || 'Sem descrição',
            type: item.type || 'Passive',
            price: this.getRandomPrice(),
            stock: 10
          }
        )

        // 2. CORREÇÃO AQUI: A chave no JSON é "image_url" (vinda do Scraper)
        if (item.image_url) {
          await product.related('images').updateOrCreate(
            { path: item.image_url }, // Busca pela URL exata
            { path: item.image_url }  // Salva a URL completa no banco
          )
        }
      }

      console.log('✅ Importação concluída com sucesso!')

    } catch (error) {
      console.error('❌ Erro na importação:', error)
    }
  }

  private getRandomPrice() {
    // Math.random() simplificado
    return parseFloat((Math.random() * (60 - 5) + 5).toFixed(2))
  }
}
