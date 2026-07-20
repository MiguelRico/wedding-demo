import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "wedding_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function isLocalAdminAuthBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.VITE_BYPASS_ADMIN_AUTH === "true"
  );
}

function secureCookieAttribute() {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}

function getRequiredEnvironment(name) {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}.`);

  return value;
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(value) {
  return createHmac("sha256", getRequiredEnvironment("ADMIN_SESSION_SECRET"))
    .update(value)
    .digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function readCookie(request, name) {
  return String(request.headers.cookie || "")
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function isValidAdminPassword(password) {
  if (isLocalAdminAuthBypassEnabled()) return true;

  return safeEqual(
    String(password || ""),
    getRequiredEnvironment("ADMIN_PASSWORD"),
  );
}

export function setAdminSession(response) {
  const payload = encode(
    JSON.stringify({ expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 }),
  );
  const session = `${payload}.${sign(payload)}`;

  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secureCookieAttribute()}`,
  );
}

export function clearAdminSession(response) {
  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookieAttribute()}`,
  );
}

export function hasAdminSession(request) {
  const session = readCookie(request, COOKIE_NAME);
  const [payload, signature] = String(session || "").split(".");

  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return false;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function requireAdminSession(request, response) {
  if (isLocalAdminAuthBypassEnabled() || hasAdminSession(request)) return true;

  response.status(401).json({ error: "Unauthorized" });
  return false;
}
