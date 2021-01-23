/* eslint-disable @typescript-eslint/camelcase */

import pagarme, { Transaction, TransactionStatus } from 'pagarme'

import {
  PaymentGateway,
  PaymentMethod,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
  PaymentTransactionStatus,
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

  private getTransactionStatus(status: TransactionStatus) {
    switch (status) {
      case 'analyzing':
        return PaymentTransactionStatus.ANALYZING
      case 'authorized':
        return PaymentTransactionStatus.AUTHORIZED
      case 'chargedback':
        return PaymentTransactionStatus.CHARGED_BACK
      case 'paid':
        return PaymentTransactionStatus.PAID
      case 'pending_refund':
      case 'pending_review':
        return PaymentTransactionStatus.PENDING
      case 'processing':
        return PaymentTransactionStatus.PROCESSING
      case 'refunded':
        return PaymentTransactionStatus.REFUNDED
      case 'refused':
        return PaymentTransactionStatus.REFUSED
      case 'waiting_payment':
        return PaymentTransactionStatus.WAITING_PAYMENT

      default:
        return PaymentTransactionStatus.PROCESSING
    }
  }
}
