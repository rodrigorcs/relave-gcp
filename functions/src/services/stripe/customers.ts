import { Stripe } from "stripe";
import { getStripeInstance } from "../../external/stripe";
import { Constants } from "../../models/constants";

export const stripeCustomersService = {
  createEphemeralKey: async (customerId: string) => {
    const stripe = await getStripeInstance();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: Constants.STRIPE_API_VERSION }
    )

    return ephemeralKey
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
  },
  getPaymentMethodByCustomerId: async (customerId: string, paymentMethodId: string) => {
    const stripe = await getStripeInstance();
    let paymentMethod: Stripe.Response<Stripe.PaymentMethod>
    try {
      paymentMethod = await stripe.customers.retrievePaymentMethod(customerId, paymentMethodId)
    } catch (error) {
      // Apple Pay
      paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    }

    return paymentMethod
  },
}