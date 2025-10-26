import router from '@adonisjs/core/services/router'

import ItemsController from '#controllers/items_controller'
import CategoriesController from '#controllers/categories_controller'

router.get('/', ()=> {return 'Super Isaac do Binding'}).as('index')

router.resource('/item', ItemsController)

router.get('/category',[CategoriesController, 'create']).as('category.create')
router.get('/gay',[CategoriesController, 'gay']).as('category.gay')
router.post('/category',[CategoriesController, 'store']).as('category.store')
