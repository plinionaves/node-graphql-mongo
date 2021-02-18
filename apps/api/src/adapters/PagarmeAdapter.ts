/* eslint-disable @typescript-eslint/camelcase */

import { format } from 'date-fns'
import pagarme, {
  Address,
  Country,
  CustomerType,
  DocumentType,
  Postback,
  TransactionStatus,
} from 'pagarme'
import qs from 'qs'

import { CustomError } from '../errors'
import {
  PaymentGateway,
  PaymentMethod,
  PaymentObject,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
  PaymentTransactionStatus,
  WebhookPayload,
} from '../interfaces'
import { Card, PaymentGatewayAcquirer } from '../types'

interface PagarmeError {
  message: string
  parameter_name: string
  type:
    | 'action_forbidden	'
    | 'internal_error'
    | 'invalid_parameter'
    | 'not_found'
}

interface PagarmeErrorPayload {
  name: string
  response: {
    errors: PagarmeError[]
    method: 'DELETE' | 'GET' | 'POST' | 'PUT'
    status: number
    url: string
  }
}

type Transaction = pagarme.Transaction & {
  card: {
    object: 'card'
    id: string
    date_created: string
    date_updated: string
    brand: string
    holder_name: string
    first_digits: string
    last_digits: string
    country: string
    fingerprint: string
    valid: boolean
    expiration_date: string
  }
}

export class PagarmeAdapter implements PaymentGateway {
  get postbackURL() {
    return process.env.WEBHOOKS_BASE_URL + '/pagarme'
  }

  processWebhook(
    headers: Record<string, string>,
    body: Record<string, string>,
  ): WebhookPayload {
    const postback: Postback = body as any
    const signature =
      headers['x-hub-signature'] &&
      headers['x-hub-signature'].replace('sha1=', '')
    const isVerified = (pagarme as any).postback.verifySignature(
      process.env.PAGARME_API_KEY,
      qs.stringify(postback),
      signature,
    )

    return isVerified
      ? {
          currentStatus: this.getTransactionStatus(postback.current_status),
          gateway: PaymentGatewayAcquirer.PAGARME,
          object: this.getPaymentObject(postback.object),
          objectId: postback[postback.object].id,
        }
      : null
  }

  private getPaymentObject(object: 'subscription' | 'transaction') {
    switch (object) {
      case 'subscription':
        return PaymentObject.SUBSCRIPTION

      default:
        return PaymentObject.TRANSACTION
    }
  }

  async transaction(
    data: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse> {
    try {
      const country = data.address.country.toLowerCase() as Country
      const address: Address = {
        city: data.address.city,
        complementary: data.address.complement,
        country,
        state: data.address.state,
        street: data.address.street,
        street_number: data.address.number + '',
        zipcode: data.address.zipcode.replace(/-|\./g, ''),
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
            phone_numbers: data.customer.phoneNumbers.map(
              phone => `+55${phone.replace(/\s|-/g, '')}`,
            ),
            type: customerType,
          }

      const client = await this.getClient()
      const transaction = (await client.transactions.create({
        amount: data.amount * 100,
        billing: {
          address,
          name: data.customer.name,
        },
        card_hash: data.cardHash,
        card_id: data.cardId,
        customer,
        items: data.items.map(item => ({
          id: item.id + '',
          quantity: item.quantity,
          tangible: item.tangible,
          title: item.name,
          unit_price: item.price * 100,
        })),
        payment_method: this.getPaymentMethod(data.paymentMethod) as any,
        postback_url: this.postbackURL,
        shipping: {
          address,
          fee: data.shipping.fee * 100,
          name: data.shipping.receiver,
          delivery_date: format(data.shipping.deliveryDate, 'yyyy-MM-dd'),
        },
      })) as Transaction

      const card: Card =
        transaction.payment_method === 'credit_card'
          ? {
              brand: transaction.card.brand,
              gateway: PaymentGatewayAcquirer.PAGARME,
              expirationDate: transaction.card.expiration_date,
              externalId: transaction.card.id,
              firstDigits: transaction.card.first_digits,
              holderName: transaction.card.holder_name,
              lastDigits: transaction.card.last_digits,
              user: data.customer.id + '',
            }
          : null

      return {
        id: transaction.id + '',
        card,
        status: this.getTransactionStatus(transaction.status),
      }
    } catch (error) {
      const pagarmeErrorPayload = error as PagarmeErrorPayload
      throw this.processErrors(pagarmeErrorPayload.response.errors)
    }
  }

  private processErrors(errors: PagarmeError[]) {
    let error: CustomError | PagarmeError

    for (const pagarmeError of errors) {
      error = this.createError(pagarmeError)

      if (error instanceof CustomError) {
        break
      }
    }

    return error
  }

  private createError(error: PagarmeError) {
    switch (error.parameter_name) {
      case 'card_expiration_date':
        return new CustomError(
          'Invalid card expiration date!',
          'INVALID_CARD_EXPIRATION_DATE_ERROR',
        )

      case 'card_cvv':
        return new CustomError('Invalid card cvv!', 'INVALID_CARD_CVV_ERROR')

      case 'card_holder_name':
        return new CustomError(
          'Invalid card holder name!',
          'INVALID_CARD_HOLDER_NAME_ERROR',
        )

      case 'card_number':
        return new CustomError(
          'Invalid card number!',
          'INVALID_CARD_NUMBER_ERROR',
        )

      case 'card_hash':
        return new CustomError('Invalid card hash!', 'INVALID_CARD_HASH_ERROR')

      case 'card_id':
        return new CustomError('Card id not found!', 'INVALID_CARD_ID_ERROR')

      default:
        return error
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
