import { PagarmeAdapter } from '../adapters'
import { PaymentsService } from '../services/PaymentsService'

export const makePaymentsService = (): PaymentsService =>
  new PaymentsService(new PagarmeAdapter())
