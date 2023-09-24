export interface IPaymentIntentData {
  paymentIntentId: string,
  customerId: string
  orderId: string,
  status: string,
  totalPaid: number,
  paidAt: number,
  paymentMethodId: string
}

export interface IPaymentData extends IPaymentIntentData {
  lastDigits?: string
  cardBrand?: string
}
