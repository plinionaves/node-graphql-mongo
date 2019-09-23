import { SchemaDirectiveVisitor } from 'graphql-tools'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { CustomError } from '../errors'
import { Context } from '../types'

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, Context>): void {
    const { resolve = defaultFieldResolver } = field

    console.log('Field: ', field)
    console.log('Directive Args: ', this.args)

    field.resolve = (...args): any => {
      if (this.args.role === 'ADMIN') {
        throw new CustomError('Unauthorized!', 'UNAUTHORIZED_ERROR')
      }

      return resolve.apply(this, args)
    }
  }
}

export { AuthDirective }
