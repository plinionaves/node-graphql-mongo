import { PagarmeAdapter } from '../adapters'
import { CardsService } from '../services/CardsService'
import { PaymentsService } from '../services/PaymentsService'

export const makePaymentsService = (): PaymentsService =>
  new PaymentsService(new CardsService(), new PagarmeAdapter())
