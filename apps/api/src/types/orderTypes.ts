import { Document, Types } from 'mongoose'
import {
  OrderItemCreateInput,
  OrderItemSubdocument,
  OrderItemUpdateInput,
  User,
} from '.'
import { PaymentMethod } from '../interfaces'

export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  IN_QUEUE = 'IN_QUEUE',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
}

export interface Order {
  _id: Types.ObjectId
  user: User | Types.ObjectId
  total: number
  status: OrderStatus
  items: Types.DocumentArray<OrderItemSubdocument>
  createdAt: string
  updatedAt: string
}

interface OrderPayInput {
  address: string
  cardHash: string
  installments?: number
  paymentMethod: PaymentMethod
  user?: string
}

export interface OrderDocument extends Order, Document {
  _id: Types.ObjectId
}

export interface OrderByIdArgs {
  _id: string
}

type OrderCreateInput = Pick<Order, 'status' | 'user'>

interface OrderUpdateInput extends OrderCreateInput {
  itemsToAdd: OrderItemCreateInput[]
  itemsToUpdate: OrderItemUpdateInput[]
  itemsToDelete: string[]
}

export interface OrderCreateArgs {
  data: OrderCreateInput & {
    items: OrderItemCreateInput[]
  }
}

export interface OrderDeleteArgs {
  _id: string
}

export interface OrderUpdateArgs extends OrderDeleteArgs {
  data: OrderUpdateInput
}

export interface OrderPayArgs extends OrderDeleteArgs {
  data: OrderPayInput
}
