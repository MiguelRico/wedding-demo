import fs from "node:fs/promises";
import path from "node:path";

const DATA_FILES = [
  "Confirmaciones", "Invitados", "Mesas", "Asientos", "AsignacionesMesa",
  "Proveedores", "Servicios", "PagosServicios", "Notificaciones", "Tareas",
  "MomentosMusicales", "EscaleraMusical", "BloquesMusicales",
];

const parseCsv = (text) => {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') { if (quoted && text[index + 1] === '"') { value += char; index += 1; } else quoted = !quoted; }
    else if (char === "," && !quoted) { row.push(value); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[index + 1] === "\n") index += 1; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers = [], ...records] = rows;
  return { headers, rows: records };
};

export default async function handler(request, response) {
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); response.status(405).end(); return; }
  if (process.env.VITE_IMPORT_DATA_ON_START !== "true") { response.status(404).end(); return; }
  try {
    const sheets = Object.fromEntries(await Promise.all(DATA_FILES.map(async (name) => {
      const csv = await fs.readFile(path.join(process.cwd(), "data", `${name}.csv`), "utf8");
      return [name, parseCsv(csv)];
    })));
    const upstream = await fetch(process.env.ADMIN_APPS_SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ method: "PUT", entity: "seed", sheets, password: process.env.ADMIN_APPS_SCRIPT_PASSWORD, contractVersion: 1 }) });
    const result = await upstream.json();
    response.status(upstream.ok && result.success !== false ? 200 : 502).json(result);
  } catch (error) {
    console.error("Demo data import failed", error);
    response.status(500).json({ error: "No se pudieron importar los datos iniciales." });
  }
}
