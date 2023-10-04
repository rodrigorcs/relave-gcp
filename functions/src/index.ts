import { logger, Response } from "firebase-functions"
import { onRequest, Request } from "firebase-functions/v2/https"
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app"
import { stripeAction } from "./actions/stripe";
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";
import { EOrderStatus } from "./models/contracts/order";
import { daySchedulesService } from "./services/daySchedules";

const STRIPE_SK = defineSecret(Secrets.STRIPE_SK)
const STRIPE_PK = defineSecret(Secrets.STRIPE_PK)
const STRIPE_WEBHOOK_SECRET = defineSecret(Secrets.STRIPE_WEBHOOK_SECRET)

initializeApp();

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
  const duration = 90 //event.data?.after.get('duration'); 

  if (newStatus === oldStatus) return
  if (newStatus === EOrderStatus.PAID) {
    logger.info(`Detected payment for order ${orderId}.`)

    try {
      const daySchedule = await daySchedulesService.getByDate(dateId);

      const { employeeId, startIndex, slotsToMark } = daySchedulesService.getAvailableEmployee(orderTimestamp, duration, daySchedule.employees)
      await daySchedulesService.updateEmployeeSchedule(dateId, daySchedule.employees, employeeId, startIndex, slotsToMark);

      logger.info(`Assigned order ${orderId} to employee ${employeeId}.`)

    } catch (error) {
      logger.error(`Error on order ${orderId}`, error)
    }
  }
})

