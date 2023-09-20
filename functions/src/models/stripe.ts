export interface IStripeCreatePaymentIntentParams {
  customerId: string
  amount: number
}

export interface IStripeCreateCustomerParams {
  customerInternalId: string
  phoneNumber: string
}