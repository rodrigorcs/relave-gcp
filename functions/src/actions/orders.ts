import { daySchedulesService } from "../services/daySchedules";
import { ordersService } from "../services/orders";

export const ordersActions = {
  addOrderToSchedule: async (orderId: string, dateId: string, orderTimestamp: number, duration: number) => {
    const daySchedule = await daySchedulesService.getByDate(dateId);

    const { employeeId, startIndex, slotsToMark } = daySchedulesService.getAvailableEmployee(orderTimestamp, duration, daySchedule.employees)
    await daySchedulesService.updateEmployeeSchedule(dateId, daySchedule.employees, employeeId, startIndex, slotsToMark);
    await ordersService.assignOrderToEmployee(orderId, employeeId)

    return employeeId
  },
}