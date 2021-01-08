export enum PaymentMethod {
  BANK_SLIP = 'BANK_SLIP',
  CREDIT_CARD = 'CREDIT_CARD',
}

export interface PaymentCustomer {
  id: string | number
  birthday: Date
  cpf?: string
  cnpj?: string
  email: string
  name: string
  phoneNumbers: string[]
}

export interface PaymentCustomerAddress {
  complement?: string
  country: string
  city: string
  neighborhood: string
  number: string | number
  receiver?: string
  state: string
  street: string
  zipcode: string
}

export interface PaymentTransactionItem {
  id: string | number
  name: string
  price: number
  quantity: number
  tangible?: boolean
}

export interface PaymentShipping {
  address: PaymentCustomerAddress
  deliveryDate: Date
  fee: number
  receiver: string
}

export interface PaymentTransactionRequest {
  address: PaymentCustomerAddress
  amount: number
  cardHash?: string
  customer: PaymentCustomer
  installments?: number
  items: PaymentTransactionItem[]
  paymentMethod: PaymentMethod
  shipping?: PaymentShipping
}

export enum PaymentTransactionStatus {
  ANALYZING = 'ANALYZING',
  CHARGED_BACK = 'CHARGED_BACK',
  PAID = 'PAID',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REFUSED = 'REFUSED',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
}

export interface PaymentTransactionResponse {
  id: string
  status: PaymentTransactionStatus
}

export interface PaymentGateway {
  transaction(
    data: PaymentTransactionRequest,
  ): Promise<PaymentTransactionResponse>
}
