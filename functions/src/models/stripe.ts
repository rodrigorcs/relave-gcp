export interface IStripeCreatePaymentIntentParams {
  customerId: string
  amount: number
}

export interface IStripeCreateCustomerParams {
  customerInternalId: string
  phone: string
}