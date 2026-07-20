import {
  findAllNotifications,
  saveAdminNotifications,
  updateAdminNotificationRead,
} from "../gateways/adminGateway";

export const notificationRepository = {
  findAll: findAllNotifications,
  saveAdmin: saveAdminNotifications,
  updateRead: updateAdminNotificationRead,
};
