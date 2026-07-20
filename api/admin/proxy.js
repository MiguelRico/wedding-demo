import { requireAdminSession } from "../_adminAuth.js";

const allowedRequests = new Set([
  "GET:confirmations",
  "GET:tables",
  "GET:providers",
  "GET:notifications",
  "GET:tasks",
  "POST:guestEmail",
  "PUT:confirmations",
  "PUT:tables",
  "PUT:providers",
  "PUT:notifications",
  "PUT:tasks",
  "PUT:notificationRead",
  "DELETE:confirmations",
]);

function getRequiredEnvironment(name) {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}.`);

  return value;
}

function parseApiResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid response from Apps Script.");
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }

  if (!requireAdminSession(request, response)) return;

  const adminRequest = request.body?.request || {};
  const method = String(adminRequest.method || "").toUpperCase();
  const entity = String(adminRequest.entity || "");

  if (!allowedRequests.has(`${method}:${entity}`)) {
    response.status(400).json({ error: "Unsupported admin request." });
    return;
  }

  const payload = { ...adminRequest };
  delete payload.password;
  const appsScriptUrl = getRequiredEnvironment("ADMIN_APPS_SCRIPT_URL");
  const appsScriptPassword = getRequiredEnvironment("ADMIN_APPS_SCRIPT_PASSWORD");

  try {
    const upstream =
      method === "GET"
        ? await fetch(buildReadUrl(appsScriptUrl, payload, appsScriptPassword))
        : await fetch(appsScriptUrl, {
            body: JSON.stringify({ ...payload, password: appsScriptPassword }),
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            method: "POST",
          });
    const result = parseApiResponse(await upstream.text());

    if (!upstream.ok || result?.success === false) {
      response.status(upstream.ok ? 502 : upstream.status).json(result);
      return;
    }

    response.status(200).json(result);
  } catch (error) {
    console.error("Admin Apps Script proxy failed", error);
    response.status(502).json({ error: "Admin service unavailable." });
  }
}

function buildReadUrl(baseUrl, payload, password) {
  const url = new URL(baseUrl);

  Object.entries({ ...payload, password }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}
