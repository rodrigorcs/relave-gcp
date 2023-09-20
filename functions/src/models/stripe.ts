export interface IStripeCreatePaymentIntentParams {
  customerId: string
  amount: number
}

export interface IStripeCreateCustomerParams {
  userId: string
  phoneNumber: string
}