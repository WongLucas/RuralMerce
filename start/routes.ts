import router from '@adonisjs/core/services/router'

import ItemsController from '#controllers/items_controller'

//router.on('/').render('pages/home')
router.get('/', ()=> {
  return 'Super Isaac do Binding'
}).as('index')

router.get('/users/:id', ({ params }) => {
  return `Xesquedele id: ${params.id}`
}).as('users.show')

router.get('/product', ({ view }) => {
  return view.render('pages/product')
})

router.resource('item', ItemsController)
