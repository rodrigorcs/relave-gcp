const PROJECT_NAME = 'relave'
const STAGE = 'sandbox'
const PREFIX = `${PROJECT_NAME}-${STAGE}`

export const Secrets = {
  STRIPE_SK: `${PREFIX}-stripe-secretkey`,
  STRIPE_PK: `${PREFIX}-stripe-publishablekey`,
  STRIPE_WEBHOOK_SECRET: `${PREFIX}-stripe-webhooksecret`,
} as const