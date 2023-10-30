export interface IStripeCreatePaymentIntentParams {
  customerId: string
  orderId: string
  amount: number
}

export interface IStripeCreateCustomerParams {
  userId: string
  phoneNumber: string
  name: string
}