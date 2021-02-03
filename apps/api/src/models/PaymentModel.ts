import { Schema, model } from 'mongoose'

import { PaymentMethod, PaymentTransactionStatus } from '../interfaces'
import { PaymentDocument, PaymentGatewayAcquirer } from '../types'

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    gateway: {
      type: String,
      enum: [PaymentGatewayAcquirer.PAGARME, PaymentGatewayAcquirer.STRIPE],
      default: PaymentGatewayAcquirer.PAGARME,
    },
    method: {
      type: String,
      enum: [PaymentMethod.BANK_SLIP, PaymentMethod.CREDIT_CARD],
      default: PaymentMethod.CREDIT_CARD,
    },
    status: {
      type: String,
      enum: [
        PaymentTransactionStatus.ANALYZING,
        PaymentTransactionStatus.AUTHORIZED,
        PaymentTransactionStatus.CHARGED_BACK,
        PaymentTransactionStatus.PAID,
        PaymentTransactionStatus.PENDING,
        PaymentTransactionStatus.PROCESSING,
        PaymentTransactionStatus.REFUNDED,
        PaymentTransactionStatus.REFUSED,
        PaymentTransactionStatus.WAITING_PAYMENT,
      ],
      default: PaymentTransactionStatus.ANALYZING,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
)

export default model<PaymentDocument>('Payment', paymentSchema)
