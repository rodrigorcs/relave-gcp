import { onRequest } from "firebase-functions/v2/https"
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app"
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";
import { createStripeCustomerHandler, addOrderToScheduleHandler, createStripePaymentIntentHandler, stripeWebhookHandler } from "./handlers";

const STRIPE_SK = defineSecret(Secrets.STRIPE_SK)
const STRIPE_PK = defineSecret(Secrets.STRIPE_PK)
const STRIPE_WEBHOOK_SECRET = defineSecret(Secrets.STRIPE_WEBHOOK_SECRET)

initializeApp();

export const createStripeCustomer = onRequest({ secrets: [STRIPE_SK, STRIPE_PK], region: 'southamerica-east1' }, createStripeCustomerHandler)
export const createStripePaymentIntent = onRequest({ secrets: [STRIPE_SK, STRIPE_PK], region: 'southamerica-east1' }, createStripePaymentIntentHandler);
export const stripeWebhook = onRequest({ secrets: [STRIPE_SK, STRIPE_WEBHOOK_SECRET], region: 'southamerica-east1' }, stripeWebhookHandler);

export const addOrderToSchedule = onDocumentUpdated('orders/{orderId}', addOrderToScheduleHandler)

