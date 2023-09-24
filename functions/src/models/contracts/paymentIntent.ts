export interface IPaymentIntentData {
  paymentIntentId: string,
  orderId: string,
  paymentStatus: string,
  totalPaid: string | null,
  paidAt: number | null,
  paymentMethodId: string | null
}
