import {
  findAllTables,
  saveAdminTablePlan,
  saveAdminTables,
} from "../gateways/adminGateway";

export const tableRepository = {
  findAll: findAllTables,
  savePlan: saveAdminTablePlan,
  saveAdmin: saveAdminTables,
};
