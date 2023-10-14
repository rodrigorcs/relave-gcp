import { onRequest } from "firebase-functions/v2/https"
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app"
import { defineSecret } from "firebase-functions/params";
import { Secrets } from "./models/constants/secrets";
import { createStripeCustomerHandler, addOrderToScheduleHandler, createStripePaymentIntentHandler, stripeWebhookHandler, getOrdersAvailabilityByDateHandler } from "./handlers";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "southamerica-east1" });

const STRIPE_SK = defineSecret(Secrets.STRIPE_SK)
const STRIPE_PK = defineSecret(Secrets.STRIPE_PK)
const STRIPE_WEBHOOK_SECRET = defineSecret(Secrets.STRIPE_WEBHOOK_SECRET)

initializeApp();

export const createStripeCustomer = onRequest({ secrets: [STRIPE_SK, STRIPE_PK] }, createStripeCustomerHandler)
export const createStripePaymentIntent = onRequest({ secrets: [STRIPE_SK, STRIPE_PK] }, createStripePaymentIntentHandler);
export const stripeWebhook = onRequest({ secrets: [STRIPE_SK, STRIPE_WEBHOOK_SECRET] }, stripeWebhookHandler);
export const getOrdersAvailabilityByDate = onRequest(getOrdersAvailabilityByDateHandler);

export const addOrderToSchedule = onDocumentUpdated('orders/{orderId}', addOrderToScheduleHandler)

