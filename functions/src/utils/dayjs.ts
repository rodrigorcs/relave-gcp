import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export enum EDateFormats {
  READABLE_DATE_TIME = 'DD [de] MMMM [às] HH:mm',
  READABLE_TIME = 'HH:mm',
  TIME_ID = 'HH-mm',
  DATE_ID = 'YYYY-MM-DD',
}

export const getZeroPointTimestamp = (orderTimestamp: number): number => {
  const orderDate = dayjs.unix(orderTimestamp).tz('America/Bahia')
  const zeroPointDate = orderDate.startOf('day');

  return zeroPointDate.unix();
};

export const getIsToday = (dateId: string): boolean => {
  return dateId === dayjs().tz('America/Bahia').format(EDateFormats.DATE_ID)
};