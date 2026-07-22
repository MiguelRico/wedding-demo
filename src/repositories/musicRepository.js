import { findAllMusic, saveAdminMusic } from "../gateways/adminGateway";
export const musicRepository = { findAll: findAllMusic, saveAdmin: saveAdminMusic };
