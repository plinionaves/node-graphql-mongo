import { Resolver, User } from '../types'
import { getFields } from '../utils'

const addresses: Resolver<{}, User> = (user, args, { db }, info) => {
  const { Address } = db

  return Address.find({
    user: user._id,
  }).select(getFields(info))
}

export default { addresses }
