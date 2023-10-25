import { Config } from "../../config"

const PREFIX = `${Config.PROJECT_NAME}-${Config.STAGE}`

export const Secrets = {
  STRIPE_SK: `${PREFIX}-stripe-secretkey`,
  STRIPE_PK: `${PREFIX}-stripe-publishablekey`,
  STRIPE_WEBHOOK_SECRET: `${PREFIX}-stripe-webhooksecret`,
} as const