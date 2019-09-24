import { ContextParameters } from 'graphql-yoga/dist/types'
import { Models } from '.'

export interface Context extends ContextParameters {
  db: Models
}
