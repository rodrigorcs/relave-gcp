import { Response } from "firebase-functions"
import { Request } from "firebase-functions/v2/https"
import { ordersActions } from "../actions/orders"

export const getOrdersAvailabilityByDateHandler = async (req: Request, res: Response) => {
  const { dateId, duration } = req.query as Record<string, string>

  try {
    const availableDates = await ordersActions.getAvailableTimesByDate(dateId, parseInt(duration))
    res.json(availableDates)
  }
  catch (error) {
    res.json({ error: (error as Error)?.message })
  }
}

