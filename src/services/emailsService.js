import { sendGuestEmail as sendGuestEmailRequest } from "../gateways/adminGateway";

export const sendGuestEmail = ({ message, password, recipients, subject }) =>
  sendGuestEmailRequest({ message, password, recipients, subject });
