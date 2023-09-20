import { getStripeInstance } from "../external/stripe";
import { Constants } from "../models/constants";

export const stripeService = {
  createEphemeralKey: async (customerId: string) => {
    const stripe = await getStripeInstance();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: Constants.STRIPE_API_VERSION }
    )

    return ephemeralKey
  },
  createPaymentIntent: async (customerId: string, amount: number) => {
    const stripe = await getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
    });

    return paymentIntent
  },
  createCustomer: async (customerInternalId: string, phoneNumber: string) => {
    const stripe = await getStripeInstance();
    const customer = await stripe.customers.create({
      phone: phoneNumber,
      metadata: {
        internalId: customerInternalId
      },
      description: 'Created by back-end',
    });

    return customer.id
  }
}