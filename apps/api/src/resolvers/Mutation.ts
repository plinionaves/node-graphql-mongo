import { compare, hash } from 'bcryptjs'
import { parse } from 'date-fns'
import { Types } from 'mongoose'
import {
  AddressCreateArgs,
  AddressUpdateArgs,
  AddressDocument,
  AddressByIdArgs,
  Models,
  MutationType,
  OrderCreateArgs,
  OrderDeleteArgs,
  OrderDocument,
  OrderPayArgs,
  OrderUpdateArgs,
  ProductByIdArgs,
  ProductCreateArgs,
  ProductDocument,
  ProductUpdateArgs,
  Resolver,
  UploadCreateArgs,
  UserDocument,
  UserSignInArgs,
  UserSignUpArgs,
  UserRole,
} from '../types'
import {
  capitilize,
  findDocument,
  findOrderItem,
  getFields,
  issueToken,
} from '../utils'
import { CustomError } from '../errors'
import { PaymentTransactionStatus } from '../interfaces'
import { uploadService } from '../services'

const createAddress: Resolver<AddressCreateArgs> = (
  _,
  args,
  { authUser, db },
) => {
  const { Address } = db
  const { data } = args
  const { _id, role } = authUser
  const user = role === UserRole.USER ? _id : data.user || _id
  const address = new Address({
    ...data,
    user,
  })
  return address.save()
}

const updateAddress: Resolver<AddressUpdateArgs> = async (
  _,
  args,
  { authUser, db },
  info,
) => {
  const { _id, data } = args
  const { _id: userId, role } = authUser
  const isAdmin = role === UserRole.ADMIN
  const where = !isAdmin ? { _id, user: userId } : null

  const address = await findDocument<AddressDocument>({
    db,
    model: 'Address',
    field: '_id',
    value: _id,
    select: getFields(info, { include: ['user'] }),
    where,
  })

  Object.keys(data).forEach(prop => (address[prop] = data[prop]))

  const user = !isAdmin ? userId : data.user || address.user
  address.user = user

  return address.save()
}

const deleteAddress: Resolver<AddressByIdArgs> = async (
  _,
  args,
  { authUser, db },
  info,
) => {
  const { _id } = args
  const where = { _id, user: authUser._id }
  const address = await findDocument<AddressDocument>({
    db,
    model: 'Address',
    field: '_id',
    value: _id,
    select: getFields(info),
    where,
  })
  return address.remove()
}

const createProduct: Resolver<ProductCreateArgs> = (_, args, { db }) => {
  const { Product } = db
  const { data } = args
  const product = new Product(data)
  return product.save()
}

const updateProduct: Resolver<ProductUpdateArgs> = async (
  _,
  args,
  { db },
  info,
) => {
  const { _id, data } = args
  const product = await findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
    select: getFields(info),
  })
  Object.keys(data).forEach(prop => (product[prop] = data[prop]))
  return product.save()
}

const deleteProduct: Resolver<ProductByIdArgs> = async (
  _,
  args,
  { db },
  info,
) => {
  const { _id } = args
  const product = await findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
    select: getFields(info),
  })
  return product.remove()
}

const signin: Resolver<UserSignInArgs> = async (_, args, { db }) => {
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

const signup: Resolver<UserSignUpArgs> = async (_, args, { db }) => {
  const { User } = db
  const { data } = args

  const birthday = parse(data.birthday, 'dd-MM-yyyy', new Date())
  const password = await hash(data.password, 10)
  const user = await new User({
    ...data,
    birthday,
    password,
  }).save()

  const { _id: sub, role } = user
  const token = issueToken({ sub, role })

  return { token, user }
}

const createOrder: Resolver<OrderCreateArgs> = async (
  _,
  args,
  { db, authUser, pubsub },
) => {
  const { data } = args
  const { _id, role } = authUser
  const { Order } = db
  const user = role === UserRole.USER ? _id : data.user || _id

  const total =
    (data &&
      data.items &&
      data.items.reduce((sum, item) => sum + item.total, 0)) ||
    0

  const order = await new Order({
    ...data,
    total,
    user,
  }).save()

  pubsub.publish('ORDER_CREATED', {
    mutation: MutationType.CREATED,
    node: order,
  })

  return order
}

const payOrder: Resolver<OrderPayArgs> = async (
  _,
  args,
  { db, authUser },
  info,
) => {
  const { Payment } = db
  const { _id, data } = args
  const { _id: userId, role } = authUser
  const isAdmin = role === UserRole.ADMIN
  const whereOrder = !isAdmin ? { _id, user: userId } : null

  const order = await findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where: whereOrder,
    select: getFields(info),
  })

  const orderPayment = await Payment.findOne({
    order: order._id,
    status: {
      $nin: [
        PaymentTransactionStatus.CHARGED_BACK,
        PaymentTransactionStatus.REFUNDED,
        PaymentTransactionStatus.REFUSED,
      ],
    },
  })
    .select('createdAt status')
    .sort('-createdAt')

  if (orderPayment) {
    const { createdAt, status } = orderPayment

    throw new CustomError(
      'This order already has a payment',
      'ORDER_PAID_ERROR',
      { createdAt, status },
    )
  }

  const user = !isAdmin ? userId : data.user || userId
  const whereAddress = !isAdmin ? { _id: data.address, user } : null

  const addressDocument = await findDocument<AddressDocument>({
    db,
    model: 'Address',
    field: '_id',
    value: data.address,
    where: whereAddress,
  })

  const userDocument = await findDocument<UserDocument>({
    db,
    model: 'User',
    field: '_id',
    value: user,
  })

  console.log('address', addressDocument)
  console.log('user', userDocument)

  return order
}

const deleteOrder: Resolver<OrderDeleteArgs> = async (
  _,
  args,
  { db, authUser, pubsub },
  info,
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
    select: getFields(info, { include: ['user'] }),
  })

  await order.remove()

  pubsub.publish('ORDER_DELETED', {
    mutation: MutationType.DELETED,
    node: order,
  })

  return order
}

const updateOrder: Resolver<OrderUpdateArgs> = async (
  _,
  args,
  { db, authUser, pubsub },
  info,
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
    select: getFields(info, { include: ['user', 'items', 'status'] }),
  })

  const user = !isAdmin ? userId : data.user || order.user

  const {
    itemsToUpdate = [],
    itemsToDelete = [],
    itemsToAdd = [],
    status,
  } = args.data

  const foundItemsToUpdate = itemsToUpdate.map(orderItem =>
    findOrderItem(order.items, orderItem._id, 'update'),
  )

  const foundItemsToDelete = itemsToDelete.map(orderItemId =>
    findOrderItem(order.items, orderItemId, 'delete'),
  )

  foundItemsToUpdate.forEach((orderItem, index) =>
    orderItem.set(itemsToUpdate[index]),
  )
  foundItemsToDelete.forEach(orderItem => orderItem.remove())

  itemsToAdd.forEach(itemToAdd => {
    const foundItem = order.items.find(item =>
      (item.product as Types.ObjectId).equals(itemToAdd.product),
    )

    if (foundItem) {
      return foundItem.set({
        quantity: foundItem.quantity + itemToAdd.quantity,
        total: foundItem.total + itemToAdd.total,
      })
    }

    order.items.push(itemToAdd)
  })

  const total = order.items.reduce((sum, item) => sum + item.total, 0)

  order.user = user
  order.status = status || order.status
  order.total = total

  await order.save()

  pubsub.publish('ORDER_UPDATED', {
    mutation: MutationType.UPDATED,
    node: order,
  })

  return order
}

const singleUpload: Resolver<UploadCreateArgs> = async (_, args, { db }) => {
  const { File } = db
  const { object, objectId } = args.data
  const model = capitilize(object) as keyof Models

  const document = await findDocument<ProductDocument>({
    db,
    model,
    field: '_id',
    value: objectId,
    select: '_id photos',
  })

  const uploadedFile = await uploadService.processUpload(args.data.file)
  const file = new File({ ...uploadedFile, object, objectId })
  await file.save()

  document.photos.push(file)
  await document.save()

  return file
}

export default {
  createAddress,
  updateAddress,
  deleteAddress,
  createProduct,
  updateProduct,
  deleteProduct,
  signin,
  signup,
  createOrder,
  updateOrder,
  payOrder,
  deleteOrder,
  singleUpload,
}
