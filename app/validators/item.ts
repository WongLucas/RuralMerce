import vine from '@vinejs/vine'

export const createItemValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(2)
      .unique({
        table:'items',
        column:'name',
      }),
    description: vine.string().trim().minLength(4)
  })
)
