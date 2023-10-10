import dayjs from 'dayjs';
import { daySchedulesRepository } from '../repositories/daySchedules'
import { EDateFormats, getZeroPointTimestamp } from '../utils/dayjs';

// Helpers

const getIndexFromTimestamp = (orderTimestamp: number, zeroPointTimestamp: number, slotDurationInSeconds: number): number => {
  return Math.floor((orderTimestamp - zeroPointTimestamp) / slotDurationInSeconds);
}

const areSlotsAvailable = (availability: string, startIndex: number, slotsToMark: number) => {
  return !availability.slice(startIndex, startIndex + slotsToMark).includes('1');
}

const getAvailableEmployees = (employees: { [key: string]: string }, startIndex: number, slotsToMark: number) => {
  return Object.entries(employees)
    .filter(([, availability]) => areSlotsAvailable(availability, startIndex, slotsToMark))
    .map(([id]) => id);
}

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

const bitStringToTimeArray = (
  bitString: string,
  intervalMinutes: number,
  duration: number,
): string[] => {
  const offsetMinutes = 60

  const bits = bitString.split('')
  const requiredBits = Math.ceil(duration / intervalMinutes)

  const now = dayjs().unix()
  const zeroPointTimestamp = getZeroPointTimestamp(now);
  const slotDurationInSeconds = intervalMinutes * 60;
  const timeCutoffIndex = getIndexFromTimestamp(now, zeroPointTimestamp, slotDurationInSeconds);

  const allDates = bits.map((bit, index) => {
    // Filter out past times
    if (index < timeCutoffIndex + (offsetMinutes / intervalMinutes)) return null

    // Filter out unavailable times
    const availableForDuration = bits.slice(index, index + requiredBits).every((b) => b === '0')
    if (!availableForDuration) return null

    return dayjs()
      .startOf('day')
      .add(index * intervalMinutes, 'minute')
      .format(EDateFormats.TIME_ID)
  })

  const availableDates = allDates.filter((time) => time !== null) as string[]
  return availableDates
}

// Service

export const daySchedulesService = {
  create: daySchedulesRepository.create,
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
  },
  getAvailableTimesByDate: async (dateId: string, duration: number): Promise<string[]> => {
    const daySchedule = await daySchedulesRepository.getByDate(dateId)
    if (!daySchedule) return bitStringToTimeArray('0'.repeat(48), 30, duration)

    const employeesAvailabilities = Object.values(daySchedule.employees).map((schedule) => {
      return bitStringToTimeArray(schedule, 30, duration)
    })

    const mergedAvailabilities = ([] as string[]).concat(...employeesAvailabilities)
    const uniqueAvailabilities = [...new Set(mergedAvailabilities)]

    return uniqueAvailabilities
  },
}