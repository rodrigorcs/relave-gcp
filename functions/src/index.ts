import { logger, Response } from "firebase-functions"
import { onRequest, Request } from "firebase-functions/v2/https"
import { initializeApp } from "firebase-admin/app"
import { stripeAction } from "./actions/stripe";
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";

initializeApp();
const STRIPE_SK = defineSecret(Secrets.STRIPE_SK)

export const paymentIntent = onRequest({ secrets: [STRIPE_SK] }, async (req: Request, res: Response) => {

  logger.info(STRIPE_SK.value())

  const { customerStripeId, amount } = req.body

  try {
    const paymentIntentKeys = await stripeAction.createPaymentIntent({ customerId: customerStripeId, amount })
    res.json(paymentIntentKeys)
  }
  catch (error) {
    res.json({ error })
  }
});

