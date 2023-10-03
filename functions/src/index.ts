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

// Pure function to find available employees
const getAvailableEmployees = (employees: { [key: string]: string }, timeSlotIndex: number) =>
  Object.entries(employees).filter(([, availability]) => availability.charAt(timeSlotIndex) === '0').map(([id]) => id);

// Pure function to find the employee with fewer assignments
const getLessOccupiedEmployee = (employees: { [key: string]: string }, availableEmployees: string[]) =>
  availableEmployees.reduce((acc, cur) =>
    (employees[cur].split('1').length < employees[acc].split('1').length ? cur : acc), availableEmployees[0]);

// Pure function to update availability strings
const updateAvailabilityString = (availability: string, timeSlotIndex: number) =>
  `${availability.substring(0, timeSlotIndex)}1${availability.substring(timeSlotIndex + 1)}`;

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
  const dateId = event.data?.after.get('dateId');

  if (newStatus === oldStatus) return
  if (newStatus === EOrderStatus.PAID) {
    logger.debug('Order is now paid, ready to pick an employee')

    try {
      const daySchedule = await daySchedulesRepository.getByDate(dateId)

      // Functional calls to get available employee and select one
      const availableEmployees = getAvailableEmployees(daySchedule.employees, 20);
      const selectedEmployee = getLessOccupiedEmployee(daySchedule.employees, availableEmployees);

      // Functional calls to update availability strings
      const updatedEmployeeAvailability = updateAvailabilityString(daySchedule.employees[selectedEmployee], 20);
      const updatedTotalBusyTimes = updateAvailabilityString(daySchedule.busyTimes, 20);

      // Apply updates
      await daySchedulesRepository.updateEmployeeSchedule(dateId, selectedEmployee, { employeeAvailability: updatedEmployeeAvailability, busyTimes: updatedTotalBusyTimes })

      return selectedEmployee;

    } catch (error) {
      console.error('Error in assignEmployee:', error);
      throw error;
    }
  }
  return null
})

