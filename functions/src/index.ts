import { logger, Response } from "firebase-functions"
import { onRequest, Request } from "firebase-functions/v2/https"
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app"
import { stripeAction } from "./actions/stripe";
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";
import { EOrderStatus } from "./models/contracts/order";
import { daySchedulesRepository } from "./repositories/daySchedules";

const STRIPE_SK = defineSecret(Secrets.STRIPE_SK)
const STRIPE_PK = defineSecret(Secrets.STRIPE_PK)
const STRIPE_WEBHOOK_SECRET = defineSecret(Secrets.STRIPE_WEBHOOK_SECRET)

initializeApp();

const getAvailableEmployees = (employees: { [key: string]: string }, startIndex: number, slotsToMark: number) =>
  Object.entries(employees)
    .filter(([, availability]) => areSlotsAvailable(availability, startIndex, slotsToMark))
    .map(([id]) => id);

const getLessOccupiedEmployee = (employees: { [key: string]: string }, availableEmployees: string[]) =>
  availableEmployees.reduce((acc, cur) =>
    (employees[cur].split('1').length < employees[acc].split('1').length ? cur : acc), availableEmployees[0]);

const getIndexFromTimestamp = (orderTimestamp: number, zeroPointTimestamp: number, slotDurationInSeconds: number): number =>
  Math.floor((orderTimestamp - zeroPointTimestamp) / slotDurationInSeconds);

const markMultipleSlots = (availability: string, startIndex: number, slotsToMark: number) => {
  const charArray = availability.split('');
  for (let i = startIndex; i < startIndex + slotsToMark; i++) {
    charArray[i] = '1';
  }
  return charArray.join('');
};

const areSlotsAvailable = (availability: string, startIndex: number, slotsToMark: number) =>
  !availability.slice(startIndex, startIndex + slotsToMark).includes('1');

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

export const createStripeCustomer = onRequest({ secrets: [STRIPE_SK, STRIPE_PK], region: 'southamerica-east1' }, async (req: Request, res: Response) => {
  const { userId, phoneNumber } = req.body

  try {
    const customer = await stripeAction.createCustomer({ userId, phoneNumber })
    res.json(customer)
  }
  catch (error) {
    res.json({ error })
  }
});

export const createStripePaymentIntent = onRequest({ secrets: [STRIPE_SK, STRIPE_PK], region: 'southamerica-east1' }, async (req: Request, res: Response) => {
  const { customerStripeId, orderId, amount } = req.body

  try {
    const paymentIntentKeys = await stripeAction.createPaymentIntent({ customerId: customerStripeId, orderId, amount })
    res.json(paymentIntentKeys)
  }
  catch (error) {
    res.json({ error })
  }
});

export const stripeWebhook = onRequest({ secrets: [STRIPE_SK, STRIPE_WEBHOOK_SECRET], region: 'southamerica-east1' }, async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string
  await stripeAction.processPaymentIntentUpdate(req.rawBody, signature)

  res.sendStatus(201);
});

export const addOrderToSchedule = onDocumentUpdated('orders/{orderId}', async (event) => {
  const oldStatus = event.data?.before.get('status');
  const newStatus = event.data?.after.get('status');
  const orderId = event.data?.after.get('id');
  const dateId = event.data?.after.get('dateId');
  const orderTimestamp = 1696320000 //event.data?.after.get('timestamp');
  const durationMinutes = 90 //event.data?.after.get('duration'); 

  if (newStatus === oldStatus) return
  if (newStatus === EOrderStatus.PAID) {
    logger.info(`Detected payment for order ${orderId}.`)

    try {
      const daySchedule = await daySchedulesRepository.getByDate(dateId);

      const zeroPointTimestamp = (new Date(dateId).getTime()) / 1000;
      const slotDurationInSeconds = 30 * 60;

      const startIndex = getIndexFromTimestamp(orderTimestamp, zeroPointTimestamp, slotDurationInSeconds);
      const slotsToMark = durationMinutes / 30;

      const availableEmployees = getAvailableEmployees(daySchedule.employees, startIndex, slotsToMark);
      const selectedEmployeeId = getLessOccupiedEmployee(daySchedule.employees, availableEmployees);

      const updatedEmployeeAvailability = markMultipleSlots(daySchedule.employees[selectedEmployeeId], startIndex, slotsToMark);

      const updatedEmployees = {
        ...daySchedule.employees,
        [selectedEmployeeId]: updatedEmployeeAvailability,
      };

      const updatedTotalBusyTimes = updateTotalBusyTimes(updatedEmployees);

      await daySchedulesRepository.updateEmployeeSchedule(dateId, selectedEmployeeId, { employeeAvailability: updatedEmployeeAvailability, busyTimes: updatedTotalBusyTimes });

      logger.info(`Assigned order ${orderId} to employee ${selectedEmployeeId}.`)

      return selectedEmployeeId;

    } catch (error) {
      console.error('Error in assignEmployee:', error);
      throw error;
    }
  }
  return null
})

