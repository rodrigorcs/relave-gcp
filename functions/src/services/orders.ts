import { ordersRepository } from '../repositories/orders'

export const ordersService = {
  updateOrderPaymentData: ordersRepository.updateOrderPaymentData,
  assignOrderToEmployee: ordersRepository.assignOrderToEmployee
}