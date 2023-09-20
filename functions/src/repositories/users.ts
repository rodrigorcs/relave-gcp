import { firestore } from "firebase-admin"
import { EFirestoreCollections } from "../models/constants/firestore"

export const usersRepository = {
  addStripeCustomerIdToUser: async (userId: string, stripeCustomerId: string) => {
    const usersCollection = firestore().collection(EFirestoreCollections.USERS)
    await usersCollection.doc(userId).update({ stripeId: stripeCustomerId })
  }
}