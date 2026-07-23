import confirmations from "../../data/Confirmaciones.csv?raw";
import guests from "../../data/Invitados.csv?raw";
import tables from "../../data/Mesas.csv?raw";
import seats from "../../data/Asientos.csv?raw";
import assignments from "../../data/AsignacionesMesa.csv?raw";
import providers from "../../data/Proveedores.csv?raw";
import services from "../../data/Servicios.csv?raw";
import payments from "../../data/PagosServicios.csv?raw";
import notifications from "../../data/Notificaciones.csv?raw";
import tasks from "../../data/Tareas.csv?raw";
import moments from "../../data/MomentosMusicales.csv?raw";
import music from "../../data/Canciones.csv?raw";
import blocks from "../../data/BloquesMusicales.csv?raw";

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
  const [headers = [], ...data] = rows;
  return { headers, rows: data };
};

export const initialSheets = Object.fromEntries(Object.entries({
  Confirmaciones: confirmations, Invitados: guests, Mesas: tables, Asientos: seats,
  AsignacionesMesa: assignments, Proveedores: providers, Servicios: services,
  PagosServicios: payments, Notificaciones: notifications, Tareas: tasks,
  MomentosMusicales: moments, EscaleraMusical: music, BloquesMusicales: blocks,
}).map(([name, csv]) => [name, parseCsv(csv)]));
