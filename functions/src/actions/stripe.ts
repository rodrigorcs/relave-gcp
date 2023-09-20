import { Secrets } from "../models/constants/secrets";
import { IStripeCreateCustomerParams, IStripeCreatePaymentIntentParams } from "../models/stripe";
import { stripeService } from "../services/stripe";
import { usersService } from "../services/users";
import { getSecret } from "../utils/secrets";

export const stripeAction = {
  createPaymentIntent: async ({ customerId, amount }: IStripeCreatePaymentIntentParams) => {
    const ephemeralKeyPromise = stripeService.createEphemeralKey(customerId)
    const paymentIntentPromise = stripeService.createPaymentIntent(customerId, amount)

    const [ephemeralKey, paymentIntent] = await Promise.all([ephemeralKeyPromise, paymentIntentPromise]);

    return {
      paymentIntentClientSecret: paymentIntent.client_secret,
      customerEphemeralKeySecret: ephemeralKey.secret,
      customerId,
      publishableKey: getSecret(Secrets.STRIPE_PK)
    }
  },
  createCustomer: async ({ userId, phoneNumber }: IStripeCreateCustomerParams) => {
    const stripeCustomer = await stripeService.createCustomer(userId, phoneNumber)
    await usersService.addStripeCustomerIdToUser(userId, stripeCustomer.id)

    return stripeCustomer
  }
}