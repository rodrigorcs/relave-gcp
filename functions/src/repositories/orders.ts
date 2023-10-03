import { firestore } from "firebase-admin"
import { EFirestoreCollections } from "../models/constants/firestore"
import { IPaymentData } from "../models/contracts/paymentIntent"
import { EOrderStatus } from "../models/contracts/order"

export const ordersRepository = {
  updateOrderPaymentData: async (paymentData: IPaymentData) => {
    const ordersCollection = firestore().collection(EFirestoreCollections.ORDERS)

    const { orderId, ...attributes } = paymentData
    await ordersCollection.doc(orderId).update({ status: EOrderStatus.PAID, payment: attributes })
  },
  assignOrderToEmployee: async (orderId: string, employeeId: string) => {
    const ordersCollection = firestore().collection(EFirestoreCollections.ORDERS)

    await ordersCollection.doc(orderId).update({ employeeId })
  }
}