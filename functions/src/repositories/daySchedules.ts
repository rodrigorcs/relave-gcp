import { firestore } from "firebase-admin"
import { EFirestoreCollections } from "../models/constants/firestore"
import { IDaySchedule } from "../models/contracts/daySchedule"

export const daySchedulesRepository = {
  getByDate: async (dateId: string) => {
    const daySchedulesCollection = firestore().collection(EFirestoreCollections.DAY_SCHEDULES)

    const snapshot = await daySchedulesCollection.doc(dateId).get()
    const daySchedule = snapshot.data() as IDaySchedule

    return daySchedule
  },
  updateEmployeeSchedule: async (dateId: string, employeeId: string, { employeeAvailability, busyTimes }: { employeeAvailability: string, busyTimes: string }) => {
    const daySchedulesCollection = firestore().collection(EFirestoreCollections.DAY_SCHEDULES)

    await daySchedulesCollection.doc(dateId).update({
      [`employees.${employeeId}`]: employeeAvailability,
      busyTimes,
    });
  },
}