import {
  PaymentGateway,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
} from '../interfaces/PaymentGateway'

export class PaymentsService {
  constructor(private paymentGateway: PaymentGateway) {}

  makePayment(
    request: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse> {
    return this.paymentGateway.transaction(request)
  }
}
