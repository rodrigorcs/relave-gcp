import { Change, logger } from "firebase-functions/v1";
import { ordersActions } from "../actions/orders";
import { EOrderStatus } from "../models/contracts/order";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestoreEvent } from "firebase-functions/v2/firestore";

export const addOrderToScheduleHandler = async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, {
  orderId: string;
}>) => {
  const oldStatus = event.data?.before.get('status');
  const newStatus = event.data?.after.get('status');
  const orderId = event.data?.after.get('id');
  const dateId = event.data?.after.get('dateId');
  const plannedStart = event.data?.after.get('plannedStart');
  const duration = event.data?.after.get('duration');

  if (newStatus === oldStatus) return
  if (newStatus === EOrderStatus.PAID) {
    logger.info(`Detected payment for order ${orderId}.`)
    try {
      const employeeId = await ordersActions.addOrderToSchedule(orderId, dateId, plannedStart, duration)
      logger.info(`Assigned order ${orderId} to employee ${employeeId}.`)
    } catch (error) {
      logger.error(`Error on order ${orderId}`, error)
    }
  }
}