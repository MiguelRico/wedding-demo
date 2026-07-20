import {
  findAllProviders,
  saveAdminProviders,
} from "../gateways/adminGateway";

export const providerRepository = {
  findAll: findAllProviders,
  saveAdmin: saveAdminProviders,
};
