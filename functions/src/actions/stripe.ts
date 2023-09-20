import { Secrets } from "../models/constants/secrets";
import { IStripeCreateCustomerParams, IStripeCreatePaymentIntentParams } from "../models/stripe";
import { stripeService } from "../services/stripe";
import { getSecret } from "../utils/secrets";

export const stripeAction = {
  createPaymentIntent: async ({ customerId, amount }: IStripeCreatePaymentIntentParams) => {
    const ephemeralKey = await stripeService.createEphemeralKey(customerId)
    const paymentIntent = await stripeService.createPaymentIntent(customerId, amount)

    return {
      paymentIntentClientSecret: paymentIntent.client_secret,
      customerEphemeralKeySecret: ephemeralKey.secret,
      customerId,
      publishableKey: getSecret(Secrets.STRIPE_PK)
    }
  },
  createCustomer: async ({ customerInternalId, phoneNumber }: IStripeCreateCustomerParams) => {
    const customer = await stripeService.createCustomer(customerInternalId, phoneNumber)

    return customer
  }
}