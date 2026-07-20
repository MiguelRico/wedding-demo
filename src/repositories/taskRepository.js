import { findAllTasks, saveAdminTasks } from "../gateways/adminGateway";

export const taskRepository = {
  findAll: findAllTasks,
  saveAdmin: saveAdminTasks,
};
