import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreate(
      { email: 'admin@admin.com' },
      {
        fullName:'Admin',
        password:'123',
        isAdmin: true,
      }
    )

    await User.updateOrCreate(
      { email: 'user@user.com'},
      {
        fullName: 'user',
        password: '123',
        isAdmin: false,
      }
    )
  }
}
