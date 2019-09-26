import { compare, hash } from 'bcryptjs'
import {
  OrderCreateArgs,
  OrderDeleteArgs,
  OrderDocument,
  OrderUpdateArgs,
  ProductByIdInput,
  ProductCreateInput,
  ProductDocument,
  ProductUpdateInput,
  Resolver,
  UserSignInInput,
  UserSignUpInput,
  UserRole,
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

const createOrder: Resolver<OrderCreateArgs> = async (
  _,
  args,
  { db, authUser },
) => {
  const { data } = args
  const { _id, role } = authUser
  const { Order } = db
  const user = role === UserRole.USER ? _id : data.user || _id

  const total =
    (data.items && data.items.reduce((sum, item) => sum + item.total, 0)) || 0

  const order = await new Order({
    ...data,
    total,
    user,
  }).save()

  return order
}

const deleteOrder: Resolver<OrderDeleteArgs> = async (
  _,
  args,
  { db, authUser },
) => {
  const { _id } = args
  const { _id: userId, role } = authUser

  const where = role === UserRole.USER ? { _id, user: userId } : null
  const order = await findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where,
  })

  return order.remove()
}

const updateOrder: Resolver<OrderUpdateArgs> = async (
  _,
  args,
  { db, authUser },
) => {
  const { data, _id } = args
  const { _id: userId, role } = authUser
  const isAdmin = role === UserRole.ADMIN

  const where = !isAdmin ? { _id, user: userId } : null
  const order = await findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where,
  })

  const user = !isAdmin ? userId : data.user || order.user

  order.user = user

  return order.save()
}

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  signin,
  signup,
  createOrder,
  updateOrder,
  deleteOrder,
}
