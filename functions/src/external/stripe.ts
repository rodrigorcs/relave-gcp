import Stripe from "stripe";
import { Constants } from "../models/constants";
import { Secrets } from "../models/constants/secrets";
import { getSecret } from "../utils/secrets";

let stripeInstance: Stripe | null = null;

export const getStripeInstance = async (): Promise<Stripe> => {
  if (!stripeInstance) {
    const STRIPE_SK = await getSecret(Secrets.STRIPE_SK);
    stripeInstance = new Stripe(STRIPE_SK, {
      apiVersion: Constants.STRIPE_API_VERSION,
    });
  }
  return stripeInstance;
};