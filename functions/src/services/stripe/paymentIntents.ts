import { getStripeInstance } from "../../external/stripe";

export const stripePaymentIntentsService = {
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
}