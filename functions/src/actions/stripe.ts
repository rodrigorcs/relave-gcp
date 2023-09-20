import { Config } from "../config";
import { stripe } from "../external/stripe";
import { IStripeCreateCustomerParams, IStripeCreatePaymentIntentParams } from "../models/stripe";
import { stripeService } from "../services/stripe";

export const stripeAction = {
  createPaymentIntent: async ({ customerId, amount }: IStripeCreatePaymentIntentParams) => {
    const ephemeralKey = await stripeService.createEphemeralKey(customerId)
    const paymentIntent = await stripeService.createPaymentIntent(customerId, amount)

    return {
      paymentIntentClientSecret: paymentIntent.client_secret,
      customerEphemeralKeySecret: ephemeralKey.secret,
      customerId,
      publishableKey: Config.STRIPE_PK
    }
  },
  createCustomer: async ({ customerInternalId, phone }: IStripeCreateCustomerParams) => {
    const customer = await stripe.customers.create({
      phone,
      metadata: {
        internalId: customerInternalId
      },
      description: 'Created by back-end',
    });

    return customer
  }
}