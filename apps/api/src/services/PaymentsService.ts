import { CardsService } from './CardsService'
import { pubsub } from '../config'
import {
  PaymentGateway,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
  PaymentTransactionStatus,
} from '../interfaces'
import { models as db } from '../models'
import {
  MutationType,
  OrderDocument,
  OrderStatus,
  PaymentDocument,
} from '../types'
import { findDocument } from '../utils'
import { CustomError } from '../errors'

export class PaymentsService {
  constructor(
    private cardsService: CardsService,
    private paymentGateway: PaymentGateway,
  ) {}

  async makePayment(
    request: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse> {
    if (request.cardId) {
      const foundCard = await this.cardsService.find({ _id: request.cardId })

      if (!foundCard) {
        throw new CustomError(
          `Card with id '${request.cardId}' not found`,
          'NOT_FOUND_ERROR',
        )
      }

      if (foundCard.user.toString() !== request.customer.id) {
        throw new CustomError('Unauthorized!', 'UNAUTHORIZED_ERROR', {
          detail: `This card does not belong to the current user`,
        })
      }

      request.cardId = foundCard.externalId
    }

    const response = await this.paymentGateway.transaction(request)

    if (request.cardHash && request.saveCard) {
      await this.cardsService.create(response.card)
    }

    return response
  }

  async processWebhook(
    headers: Record<string, string>,
    body: Record<string, string>,
  ): Promise<boolean> {
    try {
      const webhookPayload = this.paymentGateway.processWebhook(headers, body)

      if (!webhookPayload) {
        return false
      }

      const paymentObject = webhookPayload.object.toLowerCase()
      const payment = await findDocument<PaymentDocument>({
        db,
        model: 'Payment',
        select: 'order status',
        sort: '-createdAt',
        where: {
          gateway: webhookPayload.gateway,
          [`${paymentObject}Id`]: webhookPayload.objectId,
        },
      })

      payment.status = webhookPayload.currentStatus
      await payment.save()

      if (payment.status === PaymentTransactionStatus.PAID) {
        const order = await findDocument<OrderDocument>({
          db,
          model: 'Order',
          field: '_id',
          value: payment.order,
        })

        if (order.status === OrderStatus.WAITING_PAYMENT) {
          order.status = OrderStatus.IN_QUEUE

          await order.save()

          pubsub.publish('ORDER_UPDATED', {
            mutation: MutationType.UPDATED,
            node: order,
          })
        }
      }

      return true
    } catch (error) {
      return false
    }
  }
}
