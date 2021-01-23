/* eslint-disable @typescript-eslint/camelcase */

import { format } from 'date-fns'
import pagarme, {
  Address,
  Country,
  CustomerType,
  DocumentType,
  Transaction,
  TransactionStatus,
} from 'pagarme'

import {
  PaymentGateway,
  PaymentMethod,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
  PaymentTransactionStatus,
} from '../interfaces/PaymentGateway'

export class PagarmeAdapter implements PaymentGateway {
  async transaction(
    data: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse> {
    const country = data.address.country.toLowerCase() as Country
    const address: Address = {
      city: data.address.city,
      complementary: data.address.complement,
      country,
      state: data.address.state,
      street: data.address.street,
      street_number: data.address.number + '',
      zipcode: data.address.zipcode,
      neighborhood: data.address.neighborhood,
    }

    let customerType: CustomerType
    let documentNumber: string
    let documentType: DocumentType

    if (data.customer.cpf) {
      customerType = 'individual'
      documentNumber = data.customer.cpf
      documentType = 'cpf'
    } else if (data.customer.cnpj) {
      customerType = 'corporation'
      documentNumber = data.customer.cnpj
      documentType = 'cnpj'
    } else {
      customerType = 'other'
      documentType = 'other'
    }

    documentNumber = this.replaceDocumentNumber(documentNumber)

    const registeredCustomer = await this.findCustomer(
      data.customer.email,
      documentNumber,
    )

    const customer = registeredCustomer
      ? { id: registeredCustomer.id }
      : {
          country,
          documents: [{ type: documentType, number: documentNumber }],
          email: data.customer.email,
          external_id: data.customer.id + '',
          name: data.customer.name,
          phone_numbers: data.customer.phoneNumbers,
          type: customerType,
        }

    const client = await this.getClient()
    const transaction = await client.transactions.create({
      amount: data.amount * 100,
      billing: {
        address,
        name: data.customer.name,
      },
      card_hash: data.cardHash,
      customer,
      items: data.items.map(item => ({
        id: item.id + '',
        quantity: item.quantity,
        tangible: item.tangible,
        title: item.name,
        unit_price: item.price * 100,
      })),
      payment_method: this.getPaymentMethod(data.paymentMethod) as any,
      shipping: {
        address,
        fee: data.shipping.fee * 100,
        name: data.shipping.receiver,
        delivery_date: format(data.shipping.deliveryDate, 'yyyy-MM-dd'),
      },
    })

    return {
      id: transaction.id + '',
      status: this.getTransactionStatus(transaction.status),
    }
  }

  private async findCustomer(email: string, document: string) {
    const client = await this.getClient()
    const [splittedEmail] = email.split('@')
    const customers = await client.customers.all({ email: splittedEmail }, null)
    const documentNumber = this.replaceDocumentNumber(document)

    return customers.find(customer =>
      customer.documents.some(
        document =>
          this.replaceDocumentNumber(document.number) === documentNumber,
      ),
    )
  }

  private getClient() {
    return pagarme.client.connect({
      api_key: process.env.PAGARME_API_KEY,
    })
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

  private replaceDocumentNumber(document: string) {
    const regex = /\.|-|\//g
    return document.replace(regex, '')
  }
}
