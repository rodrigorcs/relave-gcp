import { getStripeInstance } from "../../external/stripe";
import { Secrets } from "../../models/constants/secrets";
import { getSecret } from "../../utils/secrets";

export const stripePaymentIntentsService = {
  createPaymentIntent: async (customerId: string, internalOrderId: string, amount: number) => {
    const stripe = await getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: internalOrderId
      }
    });

    return paymentIntent
  },
  getPaymentIntentFromEvent: async (rawBody: Buffer, signature: string) => {
    const stripe = await getStripeInstance();

    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        getSecret(Secrets.STRIPE_WEBHOOK_SECRET),
      );

      const payload = event.data.object as any

      if (event.type !== 'payment_intent.succeeded') return null

      return {
        paymentIntentId: payload.id,
        orderId: payload.metadata?.orderId,
        status: payload.status,
        totalPaid: payload.amount,
        paidAt: payload.created,
        paymentMethodId: payload.payment_method
      }
    } catch (err) {
      console.error(err)
      throw new Error('Failed to capture event data')
    }
  }
}