import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getZeroPointTimestamp = (orderTimestamp: number): number => {
  const orderDate = dayjs.unix(orderTimestamp).tz('America/Bahia')
  const zeroPointDate = orderDate.startOf('day');

  return zeroPointDate.unix();
};