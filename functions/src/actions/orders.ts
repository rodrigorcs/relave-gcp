import { daySchedulesService } from "../services/daySchedules";
import { employeesService } from "../services/employees";
import { ordersService } from "../services/orders";

// Helpers

const createDaySchedule = async (dateId: string) => {
  const employees = await employeesService.getAll()
  const employeeIds = employees.map((employee) => employee.id)
  const createdDaySchedule = await daySchedulesService.create(dateId, employeeIds)

  return createdDaySchedule
}

// Actions

export const ordersActions = {
  addOrderToSchedule: async (orderId: string, dateId: string, orderTimestamp: number, duration: number) => {
    const existingDaySchedule = await daySchedulesService.getByDate(dateId);
    const daySchedule = existingDaySchedule ?? await createDaySchedule(dateId)

    const { employeeId, startIndex, slotsToMark } = daySchedulesService.getAvailableEmployee(orderTimestamp, duration, daySchedule.employees)
    await daySchedulesService.updateEmployeeSchedule(dateId, daySchedule.employees, employeeId, startIndex, slotsToMark);
    await ordersService.assignOrderToEmployee(orderId, employeeId)

    return employeeId
  },
  getAvailableTimesByDate: daySchedulesService.getAvailableTimesByDate,
}