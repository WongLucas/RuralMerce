import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

import UsersController from '#controllers/users_controller'
import SessionController from '#controllers/session_controller'
import ProfilesController from '#controllers/profiles_controller'
import ProductsController from '#controllers/products_controller'
import CartsController from '#controllers/carts_controller'
import StockMovementsController from '#controllers/stock_movements_controller'


router.get('/', async ({ auth, view }) =>{
  return view.render('pages/home', {user: auth.user})
}).as('index')

// Login e Registro
router.get('/login', [SessionController, 'create']).as('login.create')
router.post('/login', [SessionController, 'store']).as('login.store')
router.get('/register', [UsersController, 'create']).as('user.create')
router.post('/register', [UsersController, 'store']).as('user.store')

router.get('/products', [ProductsController, 'index']).as('product.index')
router.get('/product/:id', [ProductsController, 'show']).as('product.show')

// Usuário já logado
router.group(() => {
  // Logout
  router.post('/logout', [SessionController, 'destroy']).as('logout')

  // Carrinho (Só quem tá logado compra)
  router.get('/cart', [CartsController, 'show']).as('cart.show')
  router.post('/cart/add/:id', [CartsController, 'add']).as('cart.add')
  router.put('/cart/update/:id', [CartsController, 'update']).as('cart.update')
  router.delete('/cart/remove/:id', [CartsController, 'remove']).as('cart.remove')

  // Perfil (Editar o próprio perfil)
  router.get('/profile/:id', [ProfilesController, 'show']).as('profile.show')
  router.get('/profile/edit/:id', [ProfilesController, 'edit']).as('profile.edit')
  router.put('/profile.edit/:id', [ProfilesController, 'update']).as('profile.update')

  // Adicionar ou remover estoque
  router.post('/products/:product_id/stock', [StockMovementsController, 'store']).as('stock.store')

}).use(middleware.auth())


// Rotas de administrador
router.group(() => {
  router.resource('/products', ProductsController)
    .except(['index', 'show'])
    .as('product') // Mantém o prefixo dos nomes (product.create, product.edit...)

}).middleware([middleware.auth(), middleware.admin()])
