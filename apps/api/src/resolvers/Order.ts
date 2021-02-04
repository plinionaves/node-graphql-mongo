import { Types } from 'mongoose'
import { Order, Resolver } from '../types'
import { getFields } from '../utils'

const payments: Resolver<any, Order> = (order, args, { db }, info) => {
  const { Payment } = db
  return Payment.find({
    order: order._id,
  }).select(getFields(info))
}

const user: Resolver<any, Order> = (order, args, { loaders }, info) => {
  const { userLoader } = loaders
  return userLoader.load({
    key: order.user as Types.ObjectId,
    select: getFields(info),
  })
}

export default {
  payments,
  user,
}
