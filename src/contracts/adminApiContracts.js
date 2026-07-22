export const ADMIN_API_CONTRACT_VERSION = 1;

const listFieldsByEntity = {
  confirmations: "confirmations",
  notifications: "notifications",
  providers: "providers",
  tables: "tables",
  tasks: "tasks",
  music: "music",
};

const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getContractError = (message) =>
  new Error(`Respuesta de administración inválida: ${message}`);

export function validateAdminRequest(request) {
  if (!isRecord(request)) return "La petición debe ser un objeto.";

  if (request.contractVersion !== ADMIN_API_CONTRACT_VERSION) {
    return "La versión del contrato no es compatible.";
  }

  const entity = String(request.entity || "");
  const method = String(request.method || "").toUpperCase();

  if (method === "PUT" && ["tables", "providers", "notifications", "tasks", "music"].includes(entity)) {
    if (!Array.isArray(request[entity])) {
      return `El campo ${entity} debe ser una lista.`;
    }
    if (!request[entity].every(isRecord)) {
      return `La lista ${entity} contiene elementos no válidos.`;
    }
  }
  if (method === "PUT" && entity === "music" && (!Array.isArray(request.moments) || !request.moments.every(isRecord))) {
    return "El campo moments debe ser una lista.";
  }

  if (method === "PUT" && entity === "tablePlan") {
    if (!Array.isArray(request.tables) || !Array.isArray(request.confirmations)) {
      return "El plan de mesas requiere listas de mesas y confirmaciones.";
    }
    if (!request.tables.every(isRecord) || !request.confirmations.every(isRecord)) {
      return "El plan de mesas contiene elementos no válidos.";
    }
  }

  if (method === "POST" && entity === "guestEmail") {
    if (!Array.isArray(request.recipients) || !request.recipients.length) {
      return "El email debe incluir al menos un destinatario.";
    }
    if (!String(request.subject || "").trim() || !String(request.message || "").trim()) {
      return "El email debe incluir asunto y mensaje.";
    }
  }

  if (method === "PUT" && entity === "notificationRead") {
    if (!String(request.notificationId || "").trim() || typeof request.read !== "boolean") {
      return "La actualización de aviso requiere identificador y estado.";
    }
  }

  return "";
}

export function assertAdminListResponse(entity, response) {
  const field = listFieldsByEntity[entity];

  if (!field) throw getContractError(`entidad de listado desconocida (${entity}).`);
  if (!isRecord(response)) throw getContractError("se esperaba un objeto.");
  if (response.success !== true) throw getContractError("falta confirmación de éxito.");
  if (!Array.isArray(response[field])) {
    throw getContractError(`el campo ${field} debe ser una lista.`);
  }
  if (!response[field].every(isRecord)) {
    throw getContractError(`la lista ${field} contiene elementos no válidos.`);
  }

  return response;
}

export function assertAdminMutationResponse(response) {
  if (!isRecord(response) || response.success !== true) {
    throw getContractError("la operación no confirmó su éxito.");
  }

  return response;
}
