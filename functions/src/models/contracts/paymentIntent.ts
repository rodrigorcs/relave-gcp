export interface IPaymentIntentData {
  paymentIntentId: string,
  orderId: string,
  status: string,
  totalPaid: number | null,
  paidAt: number | null,
  paymentMethodId: string | null
}
