import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'
import { context } from './config'
import { AuthDirective } from './directives'
import { catchErrorsMiddleware } from './middlewares'
import resolvers from './resolvers'
import { userLoader } from './loaders'

// [3, 1, 4, 2]

userLoader.load(3)
userLoader.load(1)
userLoader.load(1)
userLoader.load(4)
userLoader.load(1)
userLoader.load(2)
userLoader.load(4)
userLoader.load(4)

const typeDefs = resolve(__dirname, 'schema.graphql')

const server = new GraphQLServer({
  resolvers,
  typeDefs,
  context,
  middlewares: [catchErrorsMiddleware],
  schemaDirectives: {
    auth: AuthDirective,
  },
})

export default server
