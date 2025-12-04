import router from '@adonisjs/core/services/router'

import ItemsController from '#controllers/items_controller'
import CategoriesController from '#controllers/categories_controller'
import UsersController from '#controllers/users_controller'
import SessionController from '#controllers/session_controller'
import ProfilesController from '#controllers/profiles_controller'

import { middleware } from './kernel.js'
import ProductsController from '#controllers/products_controller'
import CartsController from '#controllers/carts_controller'

//Rotas que devem estar logadas
router.group(() => {
  //Rotas para os itens
  router.resource('/item', ItemsController)

  //Rotas para criação de categorias
  router.get('/category',[CategoriesController, 'create']).as('category.create')
  router.post('/category',[CategoriesController, 'store']).as('category.store')

  //Rota para poder deslogar
  router.post('/logout', [SessionController, 'destroy']).as('logout')

  //Rota dos carrinhos
  router.post('/cart/add/:id', [CartsController, 'add']).as('cart.add')
  router.get('/cart', [CartsController, 'show']).as('cart.show')
  router.put('/cart/item/:id/update', [CartsController, 'update']).as('cart.update')
  router.delete('/cart/item/:id/delete', [CartsController, 'remove']).as('cart.remove')

  //Rota dos produtos
  router.resource('/products', ProductsController).as('product')
}).use(middleware.auth())

router.get('/', async ({ auth, view }) =>{
  return view.render('pages/home', {user: auth.user})
}).as('index')

router.get('/profile/:id', [ProfilesController, 'show']).as('profile.show')
router.get('/profile/edit/:id', [ProfilesController, 'edit']).as('profile.edit')
router.put('/profile.edit/:id', [ProfilesController, 'update']).as('profile.update')

router.get('/login', [SessionController, 'create']).as('login.create')
router.post('/login', [SessionController, 'store']).as('login.store')

router.get('/register', [UsersController, 'create']).as('user.create')
router.post('/register', [UsersController, 'store']).as('user.store')





