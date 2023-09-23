import { firestore } from "firebase-admin"
import { EFirestoreCollections } from "../models/constants/firestore"

export const ordersRepository = {
  updateOrderPaymentStatus: async (orderId: string, paymentStatus: string) => {
    const ordersCollection = firestore().collection(EFirestoreCollections.ORDERS)
    await ordersCollection.doc(orderId).update({ paymentStatus })
  }
}