import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(6).nullable(),
    email: vine.string().trim().unique({
      table:'users',
      column:'email'
    }),
    password: vine.string().trim().minLength(3).confirmed()
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)
