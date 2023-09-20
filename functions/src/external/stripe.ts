import Stripe from "stripe";
import { Constants } from "../models/constants";
import { Secrets } from "../models/constants/secrets";
import { getSecret } from "../utils/secrets";

const STRIPE_SK = getSecret(Secrets.STRIPE_SK)

export const stripe = new Stripe(STRIPE_SK, {
  apiVersion: Constants.STRIPE_API_VERSION,
});