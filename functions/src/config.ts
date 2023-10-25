import { EnvVariables } from "./utils/env";

const firebaseConfig = JSON.parse(EnvVariables.FIREBASE_CONFIG);
const STAGE = firebaseConfig.projectId === 'relave-prod' ? 'prod' : 'sandbox'

export const Config = {
  PROJECT_NAME: 'relave',
  STAGE
}