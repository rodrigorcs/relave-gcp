import { firestore } from "firebase-admin"
import { EFirestoreCollections } from "../models/constants/firestore"
import { IEmployee } from "../models/contracts/employee"

export const employeesRepository = {
  getAll: async () => {
    const employeesCollection = firestore().collection(EFirestoreCollections.EMPLOYEES)

    const snapshot = await employeesCollection.get()
    const employees = snapshot.docs.map((doc) => doc.data()) as IEmployee[]

    return employees
  },
}