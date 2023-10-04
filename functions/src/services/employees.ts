import { employeesRepository } from '../repositories/employees'

export const employeesService = {
  getAll: employeesRepository.getAll
}