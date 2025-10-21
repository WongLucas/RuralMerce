import router from '@adonisjs/core/services/router'

import ItemsController from '#controllers/items_controller'

//router.on('/').render('pages/home')
router.get('/', ()=> {
  return 'Super Isaac do Binding'
}).as('index')

router.resource('/item', ItemsController)
