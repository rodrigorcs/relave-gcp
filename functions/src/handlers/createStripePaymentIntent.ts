import { Response } from "firebase-functions"
import { Request } from "firebase-functions/v2/https"
import { stripeAction } from "../actions/stripe"

export const createStripePaymentIntentHandler = async (req: Request, res: Response) => {
  const { customerStripeId, orderId, amount } = req.body

  try {
    const paymentIntentKeys = await stripeAction.createPaymentIntent({ customerId: customerStripeId, orderId, amount })
    res.json(paymentIntentKeys)
  }
  catch (error) {
    res.json({ error })
  }
}

