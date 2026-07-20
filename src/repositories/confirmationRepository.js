import {
  deleteAdminConfirmation,
  findAllConfirmations,
  saveAdminConfirmation,
} from "../gateways/adminGateway";
import {
  findConfirmationByEmail,
  findConfirmationById,
  findConfirmationByPhone,
  savePublicConfirmation,
} from "../gateways/publicRsvpGateway";

export const confirmationRepository = {
  deleteAdmin: deleteAdminConfirmation,
  findAll: findAllConfirmations,
  findByEmail: findConfirmationByEmail,
  findById: findConfirmationById,
  findByPhone: findConfirmationByPhone,
  saveAdmin: saveAdminConfirmation,
  savePublic: savePublicConfirmation,
};
