import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const getZeroPointTimestamp = (orderTimestamp: number): number => {
  const orderDate = dayjs.unix(orderTimestamp);
  const zeroPointDate = orderDate.startOf('day');

  return zeroPointDate.unix();
};