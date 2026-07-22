import { Confirmation } from "@/models";
import {
  requestJsonp,
  sendToRsvpApi,
  verifyWrite,
} from "./appScriptClient";
import { requestAdminApi } from "./adminApiClient";
import {
  assertAdminListResponse,
  assertAdminMutationResponse,
} from "../contracts/adminApiContracts";
import {
  getConfirmationComparable,
  sameFingerprint,
} from "./appScriptFingerprints";
import {
  decodeConfirmationName,
  encodeConfirmationName,
} from "@/utils/confirmationNameCodec";

const decodeConfirmationPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;

  const confirmationName = decodeConfirmationName(payload.confirmationName);

  return {
    ...payload,
    confirmationId: payload.confirmationId || payload.id || "",
    id: payload.confirmationId || payload.id || "",
    confirmationName,
    guests: Array.isArray(payload.guests)
      ? payload.guests.map((guest) => ({
          ...guest,
          confirmationName:
            decodeConfirmationName(guest.confirmationName) || confirmationName,
        }))
      : payload.guests,
  };
};

const decodeApiResponse = (response) => {
  if (Array.isArray(response)) {
    return response.map(decodeConfirmationPayload);
  }

  if (!response || typeof response !== "object") return response;

  return {
    ...decodeConfirmationPayload(response),
    confirmations: Array.isArray(response.confirmations)
      ? response.confirmations.map(decodeConfirmationPayload)
      : response.confirmations,
  };
};

const encodeConfirmationPayload = (confirmationInput) => {
  const confirmation = Confirmation.normalize(confirmationInput);
  const encodedConfirmationName = encodeConfirmationName(
    confirmation.confirmationName,
  );

  return {
    ...confirmation,
    confirmationId: confirmation.confirmationId || confirmation.id || "",
    confirmationName: encodedConfirmationName,
    guests: confirmation.guests.map((guest) => ({
      ...guest,
      confirmationName: encodedConfirmationName,
    })),
  };
};

export const findConfirmationById = async (confirmationId) => {
  return decodeApiResponse(
    await requestJsonp({
      confirmationId,
      entity: "confirmations",
      method: "GET",
    }),
  );
};

export const findConfirmationByEmail = async (email) => {
  return decodeApiResponse(
    await requestJsonp({
      email: String(email || "").trim(),
      entity: "confirmations",
      method: "GET",
    }),
  );
};

export const findConfirmationByPhone = async (phone) => {
  return decodeApiResponse(
    await requestJsonp({
      entity: "confirmations",
      method: "GET",
      phone: String(phone || "").trim(),
    }),
  );
};

export const findAllConfirmations = async ({ password } = {}) => {
  const response = await requestAdminApi({
      entity: "confirmations",
      method: "GET",
      password,
    });

  return decodeApiResponse(assertAdminListResponse("confirmations", response));
};

export const findAllTables = async ({ password } = {}) => {
  const response = await requestAdminApi({
    entity: "tables",
    method: "GET",
    password,
  });

  return assertAdminListResponse("tables", response);
};

export const findAllProviders = async ({ password } = {}) => {
  const response = await requestAdminApi({
    entity: "providers",
    method: "GET",
    password,
  });

  return assertAdminListResponse("providers", response);
};

export const findAllNotifications = async ({ password } = {}) => {
  const response = await requestAdminApi({
    entity: "notifications",
    method: "GET",
    password,
  });

  return assertAdminListResponse("notifications", response);
};

export const findAllTasks = async ({ password } = {}) => {
  const response = await requestAdminApi({
    entity: "tasks",
    method: "GET",
    password,
  });

  return assertAdminListResponse("tasks", response);
};

export const findAllMusic = async ({ password } = {}) => {
  const response = await requestAdminApi({ entity: "music", method: "GET", password });
  return assertAdminListResponse("music", response);
};

export const sendGuestEmail = async ({ message, password, recipients, subject }) => {
  const response = await requestAdminApi({
    entity: "guestEmail",
    message,
    method: "POST",
    password,
    recipients,
    subject,
  });

  return assertAdminMutationResponse(response);
};

export const savePublicConfirmation = async (payload, { method = "POST" } = {}) => {
  const confirmation = encodeConfirmationPayload(payload);
  const expectedConfirmation = getConfirmationComparable(payload);

  await sendToRsvpApi({
    ...confirmation,
    entity: "confirmations",
    method,
  });

  const verifiedResponse = await verifyWrite({
    errorMessage: "No se pudo verificar el guardado de la confirmacion.",
    isVerified: (response) =>
      response?.found !== false &&
      sameFingerprint(
        getConfirmationComparable(response),
        expectedConfirmation,
      ),
    read: () => {
      const normalizedPayload = Confirmation.normalize(payload);

      if (normalizedPayload.confirmationId || normalizedPayload.id) {
        return findConfirmationById(
          normalizedPayload.confirmationId || normalizedPayload.id,
        );
      }

      if (normalizedPayload.email) {
        return findConfirmationByEmail(normalizedPayload.email);
      }

      return findConfirmationByPhone(normalizedPayload.phone);
    },
  });

  return {
    success: true,
    confirmationId:
      verifiedResponse?.confirmationId ||
      responsePlaceholderConfirmationId(payload),
    confirmationName: Confirmation.normalize(payload).confirmationName,
  };
};

export const saveAdminConfirmation = async ({
  confirmation: confirmationInput,
  method = "PUT",
  password,
}) => {
  const confirmation = encodeConfirmationPayload(confirmationInput);
  const payload = {
    ...confirmation,
    entity: "confirmations",
    method,
    password,
  };

  const response = await requestAdminApi(payload);

  assertAdminMutationResponse(response);

  return {
    success: true,
    confirmationId:
      response?.confirmationId ||
      responsePlaceholderConfirmationId(confirmationInput),
    confirmationName: Confirmation.normalize(confirmationInput).confirmationName,
  };
};

export const saveAdminTables = async ({ password, tables }) => {
  const response = await requestAdminApi({
    entity: "tables",
    method: "PUT",
    password,
    tables,
  });

  assertAdminMutationResponse(response);

  return {
    success: true,
    tables,
  };
};

export const saveAdminTablePlan = async ({
  confirmations,
  password,
  tables,
}) => {
  const response = await requestAdminApi({
    confirmations,
    entity: "tablePlan",
    method: "PUT",
    password,
    tables,
  });

  assertAdminMutationResponse(response);

  return { confirmations, success: true, tables };
};

export const deleteAdminConfirmation = async ({ confirmationId, password }) => {
  const response = await requestAdminApi({
    entity: "confirmations",
    confirmationId,
    method: "DELETE",
    password,
  });

  assertAdminMutationResponse(response);

  return {
    success: true,
    confirmationId,
  };
};

const responsePlaceholderConfirmationId = (confirmationInput) =>
  Confirmation.normalize(confirmationInput).confirmationId;

export const saveAdminProviders = async ({ password, providers }) => {
  const response = await requestAdminApi({
    entity: "providers",
    method: "PUT",
    password,
    providers,
  });

  assertAdminMutationResponse(response);

  return {
    success: true,
    providers,
  };
};

export const saveAdminNotifications = async ({ notifications, password }) => {
  const response = await requestAdminApi({
    entity: "notifications",
    method: "PUT",
    notifications,
    password,
  });

  assertAdminMutationResponse(response);

  return {
    success: true,
    notifications,
  };
};

export const saveAdminTasks = async ({ password, tasks }) => {
  const response = await requestAdminApi({
    entity: "tasks",
    method: "PUT",
    password,
    tasks,
  });

  if (response?.success === false) throw new Error(response.error);

  return {
    success: true,
    tasks,
  };
};

export const saveAdminMusic = async ({ password, music, moments, blocks }) => {
  const response = await requestAdminApi({ entity: "music", method: "PUT", password, music, moments, blocks });
  if (response?.success === false) throw new Error(response.error);
  return { success: true, music, moments, blocks };
};

export const updateAdminNotificationRead = async ({
  notificationId,
  password,
  read,
}) => {
  const response = await requestAdminApi({
    entity: "notificationRead",
    method: "PUT",
    notificationId,
    password,
    read,
  });

  assertAdminMutationResponse(response);

  return {
    notificationId,
    read: Boolean(read),
    success: true,
  };
};

