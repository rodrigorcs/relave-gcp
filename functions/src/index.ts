import { Response } from "firebase-functions"
import { onRequest, Request } from "firebase-functions/v2/https"
import { initializeApp } from "firebase-admin/app"
import { stripeAction } from "./actions/stripe";
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";

const STRIPE_SK = defineSecret(Secrets.STRIPE_SK)
const STRIPE_PK = defineSecret(Secrets.STRIPE_PK)

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
  const { customerStripeId, amount } = req.body

  try {
    const paymentIntentKeys = await stripeAction.createPaymentIntent({ customerId: customerStripeId, amount })
    res.json(paymentIntentKeys)
  }
  catch (error) {
    res.json({ error })
  }
});

