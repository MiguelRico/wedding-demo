async function request(path, body) {
  const response = await fetch(path, {
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    method: "POST",
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo validar la sesion de administracion.");
  }

  return data;
}

export function loginAdmin(password) {
  return request("/api/admin/login", { password });
}

export function logoutAdmin() {
  return request("/api/admin/logout");
}

export function requestAdminApi(requestPayload) {
  const adminRequest = {
    ...requestPayload,
    contractVersion: ADMIN_API_CONTRACT_VERSION,
  };
  delete adminRequest.password;

  return request("/api/admin/proxy", { request: adminRequest });
}
import { ADMIN_API_CONTRACT_VERSION } from "../contracts/adminApiContracts";
