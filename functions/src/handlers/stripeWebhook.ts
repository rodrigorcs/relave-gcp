import { Response } from "firebase-functions"
import { Request } from "firebase-functions/v2/https"
import { stripeAction } from "../actions/stripe"

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string
  await stripeAction.processPaymentIntentUpdate(req.rawBody, signature)

  res.sendStatus(201);
}



