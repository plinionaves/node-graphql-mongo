import { compare, hash } from 'bcryptjs'
import {
  ProductByIdInput,
  ProductCreateInput,
  ProductDocument,
  ProductUpdateInput,
  Resolver,
  UserSignInInput,
  UserSignUpInput,
} from '../types'
import { findDocument, issueToken } from '../utils'
import { CustomError } from '../errors'

const createProduct: Resolver<ProductCreateInput> = (_, args, { db }) => {
  const { Product } = db
  const { data } = args
  const product = new Product(data)
  return product.save()
}

const updateProduct: Resolver<ProductUpdateInput> = async (_, args, { db }) => {
  const { _id, data } = args
  const product = await findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
  })
  Object.keys(data).forEach(prop => (product[prop] = data[prop]))
  return product.save()
}

const deleteProduct: Resolver<ProductByIdInput> = async (_, args, { db }) => {
  const { _id } = args
  const product = await findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
  })
  return product.remove()
}

const signin: Resolver<UserSignInInput> = async (_, args, { db }) => {
  const { User } = db
  const { email, password } = args.data
  const error = new CustomError(
    'Invalid Credentials!',
    'INVALID_CREDENTIALS_ERROR',
  )

  const user = await User.findOne({ email })
  if (!user) {
    throw error
  }

  const isValid = await compare(password, user.password)
  if (!isValid) {
    throw error
  }

  const { _id: sub, role } = user
  const token = issueToken({ sub, role })

  return { token, user }
}

const signup: Resolver<UserSignUpInput> = async (_, args, { db }) => {
  const { User } = db
  const { data } = args

  const password = await hash(data.password, 10)
  const user = await new User({
    ...data,
    password,
  }).save()

  const { _id: sub, role } = user
  const token = issueToken({ sub, role })

  return { token, user }
}

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  signin,
  signup,
}
