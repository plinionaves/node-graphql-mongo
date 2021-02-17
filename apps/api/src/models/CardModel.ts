import { Schema, model } from 'mongoose'
import { CardDocument, PaymentGatewayAcquirer } from '../types'

const cardSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    expirationDate: {
      type: String,
      required: true,
      trim: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    firstDigits: {
      type: String,
      required: true,
      trim: true,
    },
    gateway: {
      type: String,
      enum: [PaymentGatewayAcquirer.PAGARME, PaymentGatewayAcquirer.STRIPE],
      default: PaymentGatewayAcquirer.PAGARME,
    },
    holderName: {
      type: String,
      required: true,
      trim: true,
    },
    lastDigits: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default model<CardDocument>('Card', cardSchema)
