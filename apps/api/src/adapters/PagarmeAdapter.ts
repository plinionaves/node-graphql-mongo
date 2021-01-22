/* eslint-disable @typescript-eslint/camelcase */

import pagarme, { Transaction } from 'pagarme'

import {
  PaymentGateway,
  PaymentMethod,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
} from '../interfaces/PaymentGateway'

export class PagarmeAdapter implements PaymentGateway {
  transaction(
    data: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse> {
    throw new Error(`Method not implemented. ${data.paymentMethod}`)
  }

  private async findCustomer(email: string, document: string) {
    const client = await this.getClient()
    const [splittedEmail] = email.split('@')
    const customers = await client.customers.all({ email: splittedEmail }, null)
    const regex = /\.|-|\//g
    const documentNumber = document.replace(regex, '')

    return customers.find(customer =>
      customer.documents.some(
        document => document.number.replace(regex, '') === documentNumber,
      ),
    )
  }

  private getClient() {
    return pagarme.client.connect({ api_key: process.env.PAGARME_API_KEY })
  }

  private getPaymentMethod(
    paymentMethod: PaymentMethod,
  ): Transaction['payment_method'] {
    switch (paymentMethod) {
      case PaymentMethod.BANK_SLIP:
        return 'boleto'

      default:
        return 'credit_card'
    }
  }
}
