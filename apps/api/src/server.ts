import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'
import { models as db } from './models'
import { logMiddleware } from './middlewares'
import resolvers from './resolvers'

const typeDefs = resolve(__dirname, 'schema.graphql')

const server = new GraphQLServer({
  resolvers,
  typeDefs,
  context: { db },
  middlewares: [logMiddleware],
})

export default server
