import { Response } from "firebase-functions"
import { onRequest, Request } from "firebase-functions/v2/https"
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app"
import { stripeAction } from "./actions/stripe";
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";
import { addOrderToScheduleHandler } from "./handlers/addOrderToSchedule";

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

export const addOrderToSchedule = onDocumentUpdated('orders/{orderId}', addOrderToScheduleHandler)

