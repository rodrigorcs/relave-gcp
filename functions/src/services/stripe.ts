import { stripe } from "../external/stripe";
import { Constants } from "../models/constants";

export const stripeService = {
  createEphemeralKey: async (customerId: string) => {
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: Constants.STRIPE_API_VERSION }
    )

    return ephemeralKey
  },
  createPaymentIntent: async (customerId: string, amount: number) => {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
    });

    return paymentIntent
  },
  createCustomer: async () => {
    const customer = await stripe.customers.create({
      description: 'Created by back-end',
    });

    return customer
  }
}