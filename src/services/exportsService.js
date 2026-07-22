import { Guest } from "../models";
import { isMenuModuleEnabled } from "../config/features";
import { buildTables } from "./tablesService";
import { getTableSeatPositions } from "../utils/tableSeatPositions";
import { MUSIC_MOMENTS } from "../constants/music";

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
  const musicMoments = snapshot.musicMoments?.length ? snapshot.musicMoments : MUSIC_MOMENTS;
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
    {
      name: "Escalera musical",
      columns: ["Momento", "Descripción", "Nombre", "Título", "Notas"],
      rows: (snapshot.music || []).map((song) => {
        const moment = musicMoments.find((item) => item.id === song.momentId);
        return [moment?.label || song.momentId, moment?.description || "", song.name, song.title, song.notes];
      }),
    },
    {
      name: "Bloques musicales",
      columns: ["Momento", "Bloque", "Estilo", "Duración"],
      rows: (snapshot.musicBlocks || []).map((block) => {
        const moment = musicMoments.find((item) => item.id === block.momentId);
        return [moment?.label || block.momentId, block.name, block.style, block.duration];
      }),
    },
  ];
};

const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");

const wrapPdfText = (value, maxLength) => {
  const words = String(value ?? "").split(/\s+/).filter(Boolean);
  const wrappedLines = [];
  let currentLine = "";

  words.forEach((word) => {
    if (!currentLine || `${currentLine} ${word}`.length <= maxLength) {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
      return;
    }

    wrappedLines.push(currentLine);

    if (word.length <= maxLength) {
      currentLine = word;
      return;
    }

    const chunks = word.match(new RegExp(`.{1,${maxLength}}`, "g")) || [];
    wrappedLines.push(...chunks.slice(0, -1));
    currentLine = chunks.at(-1) || "";
  });

  return currentLine ? [...wrappedLines, currentLine] : wrappedLines;
};

const toPdfBytes = (value) => Uint8Array.from(value, (character) => {
  const code = character.codePointAt(0);

  return code > 255 ? 63 : code;
});

const buildPdf = (sheets, { title = "Exportación del evento" } = {}) => {
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
  const addTableRow = (values, { header = false, wrapFirstColumn = false, columnWidths } = {}) => {
    const columns = columnWidths || (wrapFirstColumn ? [190, 80, 85, 75, 81] : tableColumns);
    const cellLines = values.map((value, index) => {
      const width = columns[index];
      const text = String(value ?? "—");

      if (!header && wrapFirstColumn && index === 0) {
        return wrapPdfText(text, Math.max(Math.floor(width / 4.2), 16));
      }

      const maxLength = Math.max(Math.floor(width / 5.5), 8);
      return [text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text];
    });
    const rowHeight = header
      ? 24
      : Math.max(28, Math.max(...cellLines.map((lines) => lines.length)) * 10 + 10);

    if (y - rowHeight < margin) addPage();

    const rowY = y - rowHeight;
    const background = header ? "0.33 0.42 0.32" : "0.98 0.99 0.97";
    const textColor = header ? "1 1 1" : "0.18 0.20 0.17";
    let x = margin;

    lines.push(`q ${background} rg ${margin} ${rowY} ${tableWidth} ${rowHeight} re f Q`);
    lines.push(`q 0.78 0.84 0.75 RG 0.5 w ${margin} ${rowY} ${tableWidth} ${rowHeight} re S Q`);
    cellLines.forEach((textLines, index) => {
      const width = columns[index];

      if (index > 0) {
        lines.push(`q 0.78 0.84 0.75 RG 0.5 w ${x} ${rowY} m ${x} ${y} l S Q`);
      }
      textLines.forEach((line, lineIndex) => {
        const textY =
          rowY + rowHeight / 2 + ((textLines.length - 1) * 10) / 2 - 3 - lineIndex * 10;

        lines.push(`BT /F1 ${header ? 7 : 7.5} Tf ${textColor} rg ${x + 5} ${textY} Td (${escapePdfText(line)}) Tj ET`);
      });
      x += width;
    });
    y = rowY;
  };

  addLine(title, { color: "0.33 0.42 0.32", size: 19 });
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
    addTableRow(sheet.columns, { header: true, wrapFirstColumn: sheet.wrapFirstColumn, columnWidths: sheet.columnWidths });
    sheet.rows.forEach((row) => addTableRow(row, { wrapFirstColumn: sheet.wrapFirstColumn, columnWidths: sheet.columnWidths }));
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

const buildSeatingPlanPdf = (tables) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const tablesPerPage = 2;
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(tables.length / tablesPerPage)) },
    (_, pageIndex) => {
      const pageTables = tables.slice(
        pageIndex * tablesPerPage,
        (pageIndex + 1) * tablesPerPage,
      );
      const commands = [
        "q 0.98 0.99 0.97 rg 0 0 595 842 re f Q",
        pdfText("PLANO DE MESAS", 42, 805, 18, "0.33 0.42 0.32"),
        pdfText(
          `Pagina ${pageIndex + 1} de ${Math.max(1, Math.ceil(tables.length / tablesPerPage))}`,
          42,
          788,
          8,
          "0.43 0.46 0.41",
        ),
      ];

      pageTables.forEach((table, index) => {
        commands.push(...drawSeatingTable(table, index === 0 ? 425 : 60));
      });

      return commands;
    },
  );

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

const drawSeatingTable = (table, panelY) => {
  const panelX = 42;
  const panelWidth = 511;
  const panelHeight = 340;
  const centerX = pageCenter(panelX, panelWidth);
  const centerY = panelY + 180;
  const assigned = table.seats.filter((seat) => seat.guest).length;
  const legend = getTableLegend(table);
  const commands = [
    `q 1 1 1 rg ${panelX} ${panelY} ${panelWidth} ${panelHeight} re f Q`,
    `q 0.78 0.84 0.75 RG 0.8 w ${panelX} ${panelY} ${panelWidth} ${panelHeight} re S Q`,
    pdfText(table.name || "Mesa sin nombre", panelX + 18, panelY + 310, 14, "0.33 0.42 0.32"),
    pdfText(
      `${table.shape === "round" ? "Mesa redonda" : "Mesa rectangular"} - ${assigned}/${table.seats.length} asignados`,
      panelX + 18,
      panelY + 294,
      8,
      "0.43 0.46 0.41",
    ),
  ];

  if (table.shape === "round") {
    commands.push(pdfCircle(centerX, centerY, 52, "0.95 0.97 0.93", "0.58 0.66 0.55"));
  } else {
    commands.push(`q 0.95 0.97 0.93 rg 0.58 0.66 0.55 RG 1 w 170 ${centerY - 28} 255 56 re B Q`);
  }
  commands.push(...drawTableLegend(legend, panelX, panelY, panelWidth));

  getTableSeatPositions(table).forEach((position, index) => {
    const x = position.angle === undefined
      ? panelX + panelWidth * (position.x / 100)
      : centerX + Math.cos(position.angle) * 108;
    const y = position.angle === undefined
      ? centerY + (50 - position.y) * 2.4
      : centerY - Math.sin(position.angle) * 108;
    const assignedSeat = Boolean(position.seat.guest);

    commands.push(
      pdfCircle(
        x,
        y,
        17,
        assignedSeat ? "0.33 0.42 0.32" : "1 1 1",
        assignedSeat ? "0.33 0.42 0.32" : "0.58 0.66 0.55",
      ),
      pdfCenteredText(
        getSeatNumber(position.seat, index),
        x,
        y + 5,
        7,
        assignedSeat ? "1 1 1" : "0.33 0.42 0.32",
      ),
      pdfCenteredText(
        assignedSeat ? getGuestInitials(position.seat.guest) : "?",
        x,
        y - 7,
        8,
        assignedSeat ? "1 1 1" : "0.33 0.42 0.32",
      ),
    );

    if (assignedSeat) {
      commands.push(
        pdfCenteredText(
          truncatePdfText(getGuestName(position.seat.guest, index), 20),
          x,
          y - 25,
          7,
          "0.18 0.20 0.17",
        ),
      );
    }
  });

  return commands;
};

const pageCenter = (x, width) => x + width / 2;

const pdfText = (value, x, y, size, color) =>
  `BT /F1 ${size} Tf ${color} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(value)}) Tj ET`;

const pdfCenteredText = (value, x, y, size, color) =>
  pdfText(value, x - getPdfTextWidth(value, size) / 2, y, size, color);

const PDF_HELVETICA_WIDTHS = {
  " ": 278,
  "-": 333,
  ".": 278,
  "?": 556,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667,
  Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667,
  Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556,
  i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556,
  q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500,
  y: 500, z: 500,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556,
  8: 556, 9: 556,
};

const getPdfTextWidth = (value, size) =>
  [...String(value ?? "")].reduce(
    (width, character) => width + (PDF_HELVETICA_WIDTHS[character] || 556),
    0,
  ) * (size / 1000);

const getGuestInitials = (guest) => {
  const words = getGuestName(guest, 0).trim().split(/\s+/).filter(Boolean);

  return `${words[0]?.[0] || "?"}${words.at(-1)?.[0] || ""}`.toUpperCase();
};

const getSeatNumber = (seat, index = 0) =>
  seat.number || seat.seat || index + 1;

const drawTableLegend = (legend, panelX, panelY, panelWidth) =>
  legend.flatMap((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const chipWidth = 60;
    const chipHeight = 22;
    const x = panelX + panelWidth - 144 + column * 64;
    const y = panelY + 300 - row * 24;

    return [
      pdfRoundedRect(
        x,
        y,
        chipWidth,
        chipHeight,
        7,
        "1 1 1",
        "0.78 0.84 0.75",
      ),
      pdfText(`${item.label}:`, x + 8, y + 7, 6, "0.33 0.42 0.32"),
      pdfCenteredText(item.value, x + 53, y + 6, 9, "0.18 0.20 0.17"),
    ];
  });

const getTableLegend = (table) => {
  const assignedGuests = table.seats
    .filter((seat) => seat.guest)
    .map((seat) => seat.guest);

  return [
    ...(isMenuModuleEnabled
      ? [
          {
            label: "Pescado",
            value: assignedGuests.filter((guest) => guest.menu === "Pescado").length,
          },
          {
            label: "Carne",
            value: assignedGuests.filter((guest) => guest.menu === "Carne").length,
          },
        ]
      : []),
    {
      label: "Alergias",
      value: assignedGuests.filter(Guest.hasAllergies).length,
    },
    {
      label: "Notas",
      value: assignedGuests.filter(Guest.hasComments).length,
    },
  ];
};

const pdfCircle = (x, y, radius, fill, stroke) => {
  const control = radius * 0.55228475;

  return `q ${fill} rg ${stroke} RG 0.8 w ${x} ${y + radius} m ${x + control} ${y + radius} ${x + radius} ${y + control} ${x + radius} ${y} c ${x + radius} ${y - control} ${x + control} ${y - radius} ${x} ${y - radius} c ${x - control} ${y - radius} ${x - radius} ${y - control} ${x - radius} ${y} c ${x - radius} ${y + control} ${x - control} ${y + radius} ${x} ${y + radius} c B Q`;
};

const pdfRoundedRect = (x, y, width, height, radius, fill, stroke) => {
  const control = radius * 0.55228475;
  const right = x + width;
  const top = y + height;

  return `q ${fill} rg ${stroke} RG 0.7 w ${x + radius} ${y} m ${right - radius} ${y} l ${right - radius + control} ${y} ${right} ${y + radius - control} ${right} ${y + radius} c ${right} ${top - radius} l ${right} ${top - radius + control} ${right - radius + control} ${top} ${right - radius} ${top} c ${x + radius} ${top} l ${x + radius - control} ${top} ${x} ${top - radius + control} ${x} ${top - radius} c ${x} ${y + radius} l ${x} ${y + radius - control} ${x + radius - control} ${y} ${x + radius} ${y} c B Q`;
};

const truncatePdfText = (value, maxLength) => {
  const text = String(value || "");

  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const capitalizePdfLabel = (value) => {
  const text = String(value || "").trim();

  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "Sin categoría";
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
    name: `${confirmation.confirmationName || "Confirmación"} (${confirmation.phone || "Sin teléfono"} · ${confirmation.email || "Sin email"})`,
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
    content: buildPdf(getGroupedConfirmationPdfSheets(snapshot), {
      title: "Invitados confirmados",
    }),
    fileName: `${fileName}-${getDateStamp()}.pdf`,
    type: "application/pdf",
  });

export const downloadProvidersPdf = ({ fileName, snapshot }) =>
  downloadFile({
    content: buildPdf(
      (snapshot.providers || []).map((provider) => ({
        name: `${provider.name || "Proveedor sin nombre"} (${capitalizePdfLabel(provider.category || "Sin categoría")} · ${provider.email || "Sin email"})`,
        columns: ["Servicio", "Precio", "Pagado", "Pendiente", "Estado"],
        wrapFirstColumn: true,
        rows: (provider.services || []).map((service) => {
          const payments = service.payments || [];
          const paid = payments.filter((payment) => payment.paid).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
          const pending = payments.filter((payment) => !payment.paid).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

          return [service.name, service.price, paid, pending, pending ? "Pendiente" : "Pagado"];
        }),
      })),
      { title: "Proveedores y servicios" },
    ),
    fileName: `${fileName}-${getDateStamp()}.pdf`,
    type: "application/pdf",
  });

export const downloadTasksPdf = ({ fileName, snapshot }) => {
  const categories = new Map();

  (snapshot.tasks || []).forEach((task) => {
    const category = task.category || "Sin categoría";
    const tasks = categories.get(category) || [];

    tasks.push(task);
    categories.set(category, tasks);
  });

  return downloadFile({
    content: buildPdf(
      [...categories.entries()].map(([category, tasks]) => ({
        name: `${capitalizePdfLabel(category)} (${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"})`,
        columns: ["Tarea", "Responsable", "Fecha límite", "Prioridad", "Estado"],
        wrapFirstColumn: true,
        rows: tasks.map((task) => [
          task.title || "Sin título",
          task.responsible || "Sin asignar",
          task.maxDate || "Sin fecha",
          task.priority || "Sin prioridad",
          task.status || "Pendiente",
        ]),
      })),
      { title: "Tareas por categoría" },
    ),
    fileName: `${fileName}-${getDateStamp()}.pdf`,
    type: "application/pdf",
  });
};

export const downloadMusicPdf = ({ fileName, snapshot }) =>
  downloadFile({
    content: buildPdf(
      (snapshot.musicMoments?.length ? snapshot.musicMoments : MUSIC_MOMENTS).map((moment) => {
        const songs = (snapshot.music || []).filter((song) => song.momentId === moment.id);
        const blocks = (snapshot.musicBlocks || []).filter((block) => block.momentId === moment.id);
        return {
          name: `${moment.label} (${moment.description})`,
          columns: ["Nombre", "Título", "Notas"],
          columnWidths: [150, 170, 191],
          wrapFirstColumn: true,
          rows: [...blocks.map((block) => [`Bloque: ${block.name || "—"}`, block.style || "—", block.duration || "—"]), ...(songs.length ? songs.map((song) => [song.name || "—", song.title || "—", song.notes || "—"]) : [["Sin canciones", "—", "—"]])],
        };
      }),
      { title: "Escalera musical" },
    ),
    fileName: `${fileName}-${getDateStamp()}.pdf`,
    type: "application/pdf",
  });

export const downloadSeatingPlanPdf = ({ fileName, snapshot }) => {
  const tables = buildTables({
    confirmations: snapshot.confirmations || [],
    manualTables: snapshot.tables || [],
  });

  return downloadFile({
    content: buildSeatingPlanPdf(tables),
    fileName: `${fileName}-${getDateStamp()}.pdf`,
    type: "application/pdf",
  });

};
