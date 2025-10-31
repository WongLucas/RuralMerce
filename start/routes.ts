import router from '@adonisjs/core/services/router'

import ItemsController from '#controllers/items_controller'
import CategoriesController from '#controllers/categories_controller'
import UsersController from '#controllers/users_controller'

router.get('/', async ({ view }) =>{
  return view.render('pages/home')
}).as('index')

router.get('/register', [UsersController, 'create']).as('user.create')
router.post('/register', [UsersController, 'store']).as('user.store')

router.resource('/item', ItemsController)

router.get('/category',[CategoriesController, 'create']).as('category.create')
router.get('/gay',[CategoriesController, 'gay']).as('category.gay')
router.post('/category',[CategoriesController, 'store']).as('category.store')
