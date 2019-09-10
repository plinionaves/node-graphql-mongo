import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'

const typeDefs = resolve(__dirname, 'schema.graphql')

const USERS = [
  { id: 1, name: 'Tony Stark', email: 'tony@avengers.com' },
  { id: 2, name: 'Spider Man', email: 'spider@avengers.com' },
]

const resolvers = {
  User: {
    name: (parent): string => {
      console.log('Parent: ', parent)
      return 'User: ' + parent.name
    },
  },
  Query: {
    users: (): typeof USERS => USERS,
  },
  Mutation: {
    createUser: (parent, args): typeof USERS[0] => {
      console.log('args: ', args)
      const { data } = args
      const user = {
        ...data,
        id: USERS.length + 1,
      }
      USERS.push(user)
      return user
    },
  },
}

const server = new GraphQLServer({
  resolvers,
  typeDefs,
})

export default server
