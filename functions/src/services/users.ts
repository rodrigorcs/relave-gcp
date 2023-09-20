import { usersRepository } from '../repositories/users'

export const usersService = {
  addStripeCustomerIdToUser: usersRepository.addStripeCustomerIdToUser,
}