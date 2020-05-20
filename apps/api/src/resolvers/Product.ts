import { Product, Resolver } from '../types'
import { getFields } from '../utils'

const photos: Resolver<{}, Product> = (product, args, { db }, info) => {
  const { File } = db

  return File.find({
    object: 'Product',
    objectId: product._id,
  }).select(getFields(info, { include: ['path'] }))
}

export default { photos }
