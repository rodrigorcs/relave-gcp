import { defineSecret } from "firebase-functions/params";
import { Secrets } from "../models/constants/secrets";

type TSecretName = (typeof Secrets)[keyof typeof Secrets];

export const getSecret = (secretName: TSecretName) => {
  return defineSecret(secretName).value()
}