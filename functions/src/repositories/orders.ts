import { firestore } from "firebase-admin"
import { EFirestoreCollections } from "../models/constants/firestore"
import { IPaymentData } from "../models/contracts/paymentIntent"

export const ordersRepository = {
  updateOrderPaymentData: async (paymentData: IPaymentData) => {
    const ordersCollection = firestore().collection(EFirestoreCollections.ORDERS)

    const { orderId, ...attributes } = paymentData
    await ordersCollection.doc(orderId).update({ payment: attributes })
  }
}