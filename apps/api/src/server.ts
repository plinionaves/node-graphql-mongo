import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'
import { models as db } from './models'
import { Resolver } from './types'

const typeDefs = resolve(__dirname, 'schema.graphql')

const USERS = [
  { id: 1, name: 'Tony Stark', email: 'tony@avengers.com' },
  { id: 2, name: 'Spider Man', email: 'spider@avengers.com' },
]

const createUser: Resolver<{ data: any }> = (
  parent,
  args,
  ctx,
): typeof USERS[0] => {
  console.log('args: ', args)
  const { data } = args
  const user = {
    ...data,
    id: USERS.length + 1,
  }
  USERS.push(user)
  return user
}

const resolvers = {
  User: {
    name: (parent): string => {
      console.log('Parent: ', parent)
      return parent.name
    },
  },
  Query: {
    users: (): typeof USERS => USERS,
  },
  Mutation: {
    createUser,
  },
}

const server = new GraphQLServer({
  resolvers,
  typeDefs,
  context: { db },
})

export default server
