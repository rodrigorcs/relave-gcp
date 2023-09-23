import { ordersRepository } from '../repositories/orders'

export const ordersService = {
  updateOrderPaymentStatus: ordersRepository.updateOrderPaymentStatus,
}