import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'

import { afterCreate, BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'

import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

import Profile from '#models/profile'
import Cart from '#models/cart'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare isAdmin: boolean

  @column({ serializeAs: null })
  declare password: string

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @hasOne(() => Cart)
  declare cart: HasOne<typeof Cart>

  @afterCreate()
  static async createProfile(user: User){
    await user.related('profile').create({
      bio:'',
      nick_name:'',
    })
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
