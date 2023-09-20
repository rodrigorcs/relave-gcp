import { defineSecret } from 'firebase-functions/params'
import { Secrets } from './models/constants/secrets';

export const Config = {
  STRIPE_PK: 'pk_test_51NhYiKEsem1N0Llb2nVGVXUNZg12SO9Dw3PzviqXBarogcWlNjQCjG173AaXQCEpZDYhfi66pjekx2Af8x0ppz9700V3gWojTE',
  STRIPE_SK: defineSecret(Secrets.STRIPE_SK).value
} as const