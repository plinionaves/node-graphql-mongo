import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'
import { models as db } from './models'
import { AuthDirective } from './directives'
import { catchErrorsMiddleware } from './middlewares'
import resolvers from './resolvers'

const typeDefs = resolve(__dirname, 'schema.graphql')

const server = new GraphQLServer({
  resolvers,
  typeDefs,
  context: { db },
  middlewares: [catchErrorsMiddleware],
  schemaDirectives: {
    auth: AuthDirective,
  },
})

export default server
