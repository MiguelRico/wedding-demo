export default async function handler(request, response) {
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); response.status(405).end(); return; }
  if (process.env.VITE_IMPORT_DATA_ON_START !== "true") { response.status(404).end(); return; }
  try {
    const sheets = request.body?.sheets;
    if (!sheets || typeof sheets !== "object") throw new Error("Faltan los datos CSV a importar.");
    const upstream = await fetch(process.env.ADMIN_APPS_SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ method: "PUT", entity: "seed", sheets, password: process.env.ADMIN_APPS_SCRIPT_PASSWORD, contractVersion: 1 }) });
    const result = await upstream.json();
    response.status(upstream.ok && result.success !== false ? 200 : 502).json(result);
  } catch (error) {
    console.error("Demo data import failed", error);
    response.status(500).json({ error: "No se pudieron importar los datos iniciales." });
  }
}
