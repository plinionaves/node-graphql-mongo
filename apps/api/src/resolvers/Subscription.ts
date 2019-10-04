import { Order, SubscriptionResolver } from '../types'

const order: SubscriptionResolver<Order> = {
  subscribe: (_, args, ctx) => {
    const { mutationIn } = args.where
    const { pubsub } = ctx
    const channels = mutationIn.map(m => `ORDER_${m}`)
    return pubsub.asyncIterator(channels)
  },
  resolve: payload => {
    console.log('Payload: ', payload)
    return payload
  },
}

export default {
  order,
}
