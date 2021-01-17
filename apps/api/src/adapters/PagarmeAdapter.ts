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
}
