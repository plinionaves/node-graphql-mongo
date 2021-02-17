import { Document, Types } from 'mongoose'

import { PaymentGatewayAcquirer } from './paymentTypes'
import { User } from '.'

export interface Card {
  _id?: Types.ObjectId
  brand: string
  expirationDate: string
  externalId: string
  firstDigits: string
  gateway: PaymentGatewayAcquirer
  holderName: string
  lastDigits: string
  user: User | Types.ObjectId | string
}

export interface CardDocument extends Card, Document {
  _id: Types.ObjectId
}
