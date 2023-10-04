import { Response } from "firebase-functions"
import { Request } from "firebase-functions/v2/https"
import { stripeAction } from "../actions/stripe"

export const createStripeCustomerHandler = async (req: Request, res: Response) => {
  const { userId, phoneNumber } = req.body

  try {
    const customer = await stripeAction.createCustomer({ userId, phoneNumber })
    res.json(customer)
  }
  catch (error) {
    res.json({ error })
  }
}