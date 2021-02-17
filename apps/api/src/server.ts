import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'
import bodyParser from 'body-parser'
import express from 'express'

import { context } from './config'
import { AuthDirective } from './directives'
import { catchErrorsMiddleware } from './middlewares'
import { paymentsService } from './services'
import resolvers from './resolvers'

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

server.use(
  '/static',
  express.static(resolve(__dirname, '..', 'tmp', 'uploads')),
)

server.express.post(
  '/webhooks/pagarme',
  bodyParser.urlencoded(),
  async (req, res) => {
    const validated = await paymentsService.processWebhook(
      req.headers as any,
      req.body,
    )
    const status = validated ? 200 : 412

    res.status(status).json({ ok: validated })
  },
)

export default server
