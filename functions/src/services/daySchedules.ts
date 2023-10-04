import { daySchedulesRepository } from '../repositories/daySchedules'
import { getZeroPointTimestamp } from '../utils/dayjs';

// Helpers

const getIndexFromTimestamp = (orderTimestamp: number, zeroPointTimestamp: number, slotDurationInSeconds: number): number =>
  Math.floor((orderTimestamp - zeroPointTimestamp) / slotDurationInSeconds);

const areSlotsAvailable = (availability: string, startIndex: number, slotsToMark: number) =>
  !availability.slice(startIndex, startIndex + slotsToMark).includes('1');

const getAvailableEmployees = (employees: { [key: string]: string }, startIndex: number, slotsToMark: number) =>
  Object.entries(employees)
    .filter(([, availability]) => areSlotsAvailable(availability, startIndex, slotsToMark))
    .map(([id]) => id);

const getLessOccupiedEmployee = (employees: { [key: string]: string }, availableEmployees: string[]) =>
  availableEmployees.reduce((acc, cur) =>
    (employees[cur].split('1').length < employees[acc].split('1').length ? cur : acc), availableEmployees[0]);

const markMultipleSlots = (availability: string, startIndex: number, slotsToMark: number) => {
  const charArray = availability.split('');
  for (let i = startIndex; i < startIndex + slotsToMark; i++) {
    charArray[i] = '1';
  }
  return charArray.join('');
};

const updateTotalBusyTimes = (
  employees: { [key: string]: string }
): string => {
  const numSlots = Object.values(employees)[0].length;
  let updatedTotalBusyTimes = '';

  for (let i = 0; i < numSlots; i++) {
    const allEmployeesBusy = Object.values(employees).every(
      (availability) => availability.charAt(i) === '1'
    );

    updatedTotalBusyTimes += allEmployeesBusy ? '1' : '0';
  }

  return updatedTotalBusyTimes;
};

// Service

export const daySchedulesService = {
  getByDate: daySchedulesRepository.getByDate,
  updateEmployeeSchedule: async (dateId: string, employees: Record<string, string>, employeeId: string, startIndex: number, slotsToMark: number) => {
    const updatedEmployeeAvailability = markMultipleSlots(employees[employeeId], startIndex, slotsToMark);

    const updatedEmployees = {
      ...employees,
      [employeeId]: updatedEmployeeAvailability,
    };

    const updatedTotalBusyTimes = updateTotalBusyTimes(updatedEmployees);
    await daySchedulesRepository.updateEmployeeSchedule(dateId, employeeId, { employeeAvailability: updatedEmployeeAvailability, busyTimes: updatedTotalBusyTimes })
  },
  getAvailableEmployee: (orderTimestamp: number, duration: number, employees: Record<string, string>) => {
    const zeroPointTimestamp = getZeroPointTimestamp(orderTimestamp);
    const slotDurationInSeconds = 30 * 60;

    const startIndex = getIndexFromTimestamp(orderTimestamp, zeroPointTimestamp, slotDurationInSeconds);
    const slotsToMark = duration / 30;

    const availableEmployees = getAvailableEmployees(employees, startIndex, slotsToMark);
    const employeeId = getLessOccupiedEmployee(employees, availableEmployees);

    return { employeeId, startIndex, slotsToMark }
  }
}