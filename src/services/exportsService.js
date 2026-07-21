import { Guest } from "../models";
import { buildTables } from "./tablesService";

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getDateStamp = () => new Date().toISOString().slice(0, 10);

const getGuestName = (guest, index) => Guest.getDisplayName(guest, index);
const getListValue = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

const toSheetXml = ({ columns, name, rows }) => `
  <Worksheet ss:Name="${escapeXml(name.slice(0, 31))}">
    <Table>
      <Row>${columns.map((column) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(column)}</Data></Cell>`).join("")}</Row>
      ${rows
        .map(
          (row) =>
            `<Row>${row
              .map(
                (value) =>
                  `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`,
              )
              .join("")}</Row>`,
        )
        .join("")}
    </Table>
  </Worksheet>`;

const createWorkbookXml = (sheets) => `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#dfe8d7" ss:Pattern="Solid"/></Style>
  </Styles>
  ${sheets.map(toSheetXml).join("")}
</Workbook>`;

const downloadFile = ({ content, fileName, type }) => {
  const blob = new Blob([content], {
    type,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.download = fileName;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

const getAdminExportSheets = (snapshot) => {
  const confirmations = snapshot.confirmations || [];
  const tables = buildTables({
    confirmations,
    manualTables: snapshot.tables || [],
  });
  return [
    {
      name: "Confirmaciones",
      columns: ["ID", "Nombre", "Email", "Teléfono", "Invitados"],
      rows: confirmations.map((confirmation) => [
        confirmation.confirmationId || confirmation.id,
        confirmation.confirmationName,
        confirmation.email,
        confirmation.phone,
        confirmation.guests?.length || 0,
      ]),
    },
    {
      name: "Invitados",
      columns: ["Confirmación ID", "Confirmación", "Invitado", "Alergias", "Otras alergias", "Menú", "Bus ida", "Bus vuelta", "Notas"],
      rows: confirmations.flatMap((confirmation) =>
        (confirmation.guests || []).map((guest, index) => [
          confirmation.confirmationId || confirmation.id,
          confirmation.confirmationName,
          getGuestName(guest, index),
          getListValue(guest.allergies),
          guest.otherAllergies,
          guest.menu,
          guest.outboundBus,
          guest.returnBus,
          guest.comments,
        ]),
      ),
    },
    {
      name: "Mesas",
      columns: ["ID", "Mesa", "Grupo", "Forma", "Asientos", "Notas"],
      rows: tables.map((table) => [
        table.tableId || table.id,
        table.name,
        table.group || table.tag,
        table.shape,
        table.seats?.length || 0,
        table.notes,
      ]),
    },
    {
      name: "Asignaciones",
      columns: ["Mesa", "Asiento", "Invitado", "Confirmación"],
      rows: tables.flatMap((table) =>
        (table.seats || [])
          .filter((seat) => seat.guest)
          .map((seat, index) => [
            table.name,
            seat.number || index + 1,
            getGuestName(seat.guest, index),
            seat.guest.confirmationName,
          ]),
      ),
    },
    {
      name: "Proveedores",
      columns: ["ID", "Proveedor", "Categoría", "Teléfono", "Email", "Web", "Activo"],
      rows: (snapshot.providers || []).map((provider) => [
        provider.providerId || provider.id,
        provider.name,
        provider.category,
        provider.phone,
        provider.email,
        provider.web,
        provider.active ? "Sí" : "No",
      ]),
    },
    {
      name: "Servicios",
      columns: ["Proveedor", "Servicio", "Precio", "Pagado", "Pendiente", "Notas"],
      rows: (snapshot.providers || []).flatMap((provider) =>
        (provider.services || []).map((service) => [
          provider.name,
          service.name,
          service.price,
          (service.payments || [])
            .filter((payment) => payment.paid)
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
          (service.payments || [])
            .filter((payment) => !payment.paid)
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
          service.notes,
        ]),
      ),
    },
    {
      name: "Notificaciones",
      columns: ["ID", "Título", "Detalle", "Fecha", "Tipo", "Leída"],
      rows: (snapshot.notifications || []).map((notification) => [
        notification.id,
        notification.title,
        notification.detail,
        notification.date,
        notification.type,
        notification.read ? "Sí" : "No",
      ]),
    },
    {
      name: "Tareas",
      columns: ["ID", "Título", "Categoría", "Responsable", "Fecha límite", "Prioridad", "Estado", "Descripción"],
      rows: (snapshot.tasks || []).map((task) => [
        task.id,
        task.title,
        task.category,
        task.responsible,
        task.maxDate,
        task.priority,
        task.status,
        task.description,
      ]),
    },
  ];
};

const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");

const toPdfBytes = (value) => Uint8Array.from(value, (character) => {
  const code = character.codePointAt(0);

  return code > 255 ? 63 : code;
});

const buildPdf = (sheets) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 42;
  const lineHeight = 13;
  const tableWidth = pageWidth - margin * 2;
  const tableColumns = [108, 72, 126, 96, 109];
  const pages = [];
  let lines = [];
  let y = pageHeight - margin;

  const addPage = () => {
    if (lines.length) pages.push(lines);
    lines = [];
    y = pageHeight - margin;
  };
  const addLine = (text, { color = "0.18 0.20 0.17", size = 9 } = {}) => {
    if (y < margin + lineHeight) addPage();
    lines.push(`BT /F1 ${size} Tf ${color} rg ${margin} ${y} Td (${escapePdfText(text)}) Tj ET`);
    y -= lineHeight;
  };
  const addTableRow = (values, { header = false } = {}) => {
    const rowHeight = header ? 24 : 28;

    if (y - rowHeight < margin) addPage();

    const rowY = y - rowHeight;
    const background = header ? "0.33 0.42 0.32" : "0.98 0.99 0.97";
    const textColor = header ? "1 1 1" : "0.18 0.20 0.17";
    let x = margin;

    lines.push(`q ${background} rg ${margin} ${rowY} ${tableWidth} ${rowHeight} re f Q`);
    lines.push(`q 0.78 0.84 0.75 RG 0.5 w ${margin} ${rowY} ${tableWidth} ${rowHeight} re S Q`);
    values.forEach((value, index) => {
      const width = tableColumns[index];
      const maxLength = Math.max(Math.floor(width / 5.5), 8);
      const text = String(value ?? "—");
      const cellText = text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

      if (index > 0) {
        lines.push(`q 0.78 0.84 0.75 RG 0.5 w ${x} ${rowY} m ${x} ${y} l S Q`);
      }
      lines.push(`BT /F1 ${header ? 7 : 7.5} Tf ${textColor} rg ${x + 5} ${rowY + rowHeight / 2 - 3} Td (${escapePdfText(cellText)}) Tj ET`);
      x += width;
    });
    y = rowY;
  };

  addLine("Exportación del evento", { color: "0.33 0.42 0.32", size: 19 });
  addLine(`Generado el ${new Date().toLocaleString("es-ES")}`, {
    color: "0.43 0.46 0.41",
  });
  y -= 8;

  sheets.forEach((sheet) => {
    const tableHeight = 24 + sheet.rows.length * 28;
    const groupHeight = lineHeight * (sheet.detail ? 2 : 1) + tableHeight + 32;

    if (y - groupHeight < margin) addPage();
    addLine(sheet.name, { color: "0.33 0.42 0.32", size: 13 });
    if (sheet.detail) {
      addLine(sheet.detail, { color: "0.43 0.46 0.41", size: 8 });
    }
    addTableRow(sheet.columns, { header: true });
    sheet.rows.forEach((row) => addTableRow(row));
    y -= 24;
  });
  addPage();

  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", ""];
  const pageObjectIds = pages.map((_, index) => 3 + index * 2);
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  pages.forEach((page, index) => {
    const pageId = pageObjectIds[index];
    const contentId = pageId + 1;
    const stream = page.join("\n");

    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId - 1] = `<< /Length ${toPdfBytes(stream).length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = toPdfBytes(pdf).length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = toPdfBytes(pdf).length;

  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return toPdfBytes(pdf);
};

const getGroupedConfirmationPdfSheets = (snapshot) => {
  const tables = buildTables({
    confirmations: snapshot.confirmations || [],
    manualTables: snapshot.tables || [],
  });
  const assignments = new Map(
    tables.flatMap((table) =>
      (table.seats || [])
        .filter((seat) => seat.guest)
        .map((seat, index) => [
          seat.guest.guestId || seat.guest.id,
          `${table.name} · ${seat.number || index + 1}`,
        ]),
    ),
  );

  return (snapshot.confirmations || []).map((confirmation) => ({
    name: confirmation.confirmationName || "Confirmación",
    detail: `${confirmation.email || "Sin email"} · ${confirmation.phone || "Sin teléfono"}`,
    columns: ["Invitado", "Menú", "Alergias", "Transporte", "Mesa / asiento"],
    rows: (confirmation.guests || []).map((guest, index) => [
      getGuestName(guest, index),
      guest.menu || "—",
      getListValue(guest.allergies),
      `${guest.outboundBus || "No"} / ${guest.returnBus || "No"}`,
      assignments.get(guest.guestId || guest.id) || "Sin asignar",
    ]),
  }));
};

export const downloadAdminWorkbook = ({ fileName, snapshot }) => {
  const sheets = getAdminExportSheets(snapshot);

  downloadFile({
    content: createWorkbookXml(sheets),
    fileName: `${fileName}-${getDateStamp()}.xls`,
    type: "application/vnd.ms-excel;charset=utf-8",
  });
};

export const downloadAdminPdf = ({ fileName, snapshot }) =>
  downloadFile({
    content: buildPdf(getGroupedConfirmationPdfSheets(snapshot)),
    fileName: `${fileName}-${getDateStamp()}.pdf`,
    type: "application/pdf",
  });
