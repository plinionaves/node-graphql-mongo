/* eslint-disable @typescript-eslint/camelcase */

import pagarme from 'pagarme'

import {
  PaymentGateway,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
} from '../interfaces/PaymentGateway'

export class PagarmeAdapter implements PaymentGateway {
  transaction(
    data: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse> {
    throw new Error(`Method not implemented. ${data.paymentMethod}`)
  }

  private getClient() {
    return pagarme.client.connect({ api_key: process.env.PAGARME_API_KEY })
  }
}
