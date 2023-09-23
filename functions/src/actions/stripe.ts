import { Secrets } from "../models/constants/secrets";
import { IStripeCreateCustomerParams, IStripeCreatePaymentIntentParams } from "../models/stripe";
import { stripePaymentIntentsService } from "../services/stripe/paymentIntents";
import { stripeCustomersService } from "../services/stripe/customers";
import { usersService } from "../services/users";
import { getSecret } from "../utils/secrets";

export const stripeAction = {
  createPaymentIntent: async ({ customerId, amount }: IStripeCreatePaymentIntentParams) => {
    const ephemeralKeyPromise = stripeCustomersService.createEphemeralKey(customerId)
    const paymentIntentPromise = stripePaymentIntentsService.createPaymentIntent(customerId, amount)

    const [ephemeralKey, paymentIntent] = await Promise.all([ephemeralKeyPromise, paymentIntentPromise]);

    return {
      paymentIntentClientSecret: paymentIntent.client_secret,
      customerEphemeralKeySecret: ephemeralKey.secret,
      customerId,
      publishableKey: getSecret(Secrets.STRIPE_PK)
    }
  },
  createCustomer: async ({ userId, phoneNumber }: IStripeCreateCustomerParams) => {
    const stripeCustomerId = await stripeCustomersService.createCustomer(userId, phoneNumber)
    await usersService.addStripeCustomerIdToUser(userId, stripeCustomerId)

    return stripeCustomerId
  }
}