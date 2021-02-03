import { Document, Types } from 'mongoose'

import { PaymentMethod, PaymentTransactionStatus } from '../interfaces'
import { Order } from '.'

export enum PaymentGatewayAcquirer {
  PAGARME = 'PAGARME',
  STRIPE = 'STRIPE',
}

export interface Payment {
  _id: Types.ObjectId
  order: Order | Types.ObjectId
  gateway: PaymentGatewayAcquirer
  method: PaymentMethod
  status: PaymentTransactionStatus
  transactionId: string
  createdAt: string
  updatedAt: string
}

export interface PaymentDocument extends Payment, Document {
  _id: Types.ObjectId
}
