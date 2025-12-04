import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'

export default class extends BaseSeeder {
  async run() {
    const filePath = app.makePath('isaac_items_full.json')

    try {
      // 2. Lê o arquivo
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const items = JSON.parse(fileContent)

      console.log(`📦 Iniciando importação de ${items.length} itens...`)

      for (const item of items) {

        // Ajuste aqui as chaves conforme o seu JSON do Python (Name, Description, Effect, etc)
        // O Scraper geralmente retorna chaves com Maiúscula (ex: "Name", "Type")

        await Product.updateOrCreate(
          { name: item.Name }, // Critério de busca (evita duplicar se rodar 2x)
          {
            description: item.Description || item.Effect || 'Sem descrição',
            type: item.type, // 'Active' ou 'Passive' vindo do scraper

            // Gerando dados fictícios para a loja
            price: this.getRandomPrice(),
            stock: 10
          }
        )
      }

      console.log('✅ Importação concluída com sucesso!')

    } catch (error) {
      console.error('❌ Erro ao importar o JSON. Verifique se o arquivo existe na raiz.', error)
    }
  }

  // Função auxiliar para gerar preços "estilo Isaac" (ex: 15.00, 25.50)
  private getRandomPrice() {
    const min = 5
    const max = 60
    const price = Math.random() * (max - min) + min
    return parseFloat(price.toFixed(2))
  }
}
