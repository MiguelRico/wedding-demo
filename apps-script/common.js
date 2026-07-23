/* eslint-disable */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  ensureHeader(sheet, headers);

  return sheet;
}

function getConfirmationsSheet() {
  return getOrCreateSheet(CONFIRMATIONS_SHEET_NAME, CONFIRMATIONS_HEADERS);
}

function getSheet() {
  return getOrCreateSheet(SHEET_NAME, GUESTS_HEADERS);
}

const CONFIRMATIONS_HEADERS = [
  "confirmationId",
  "confirmationName",
  "email",
  "phone",
  "guestCount",
  "createdAt",
  "updatedAt",
];

const CONFIRMATIONS_COLUMNS = {
  confirmationId: 0,
  confirmationName: 1,
  email: 2,
  phone: 3,
  guestCount: 4,
  createdAt: 5,
  updatedAt: 6,
};

const GUESTS_HEADERS = [
  "guestId",
  "confirmationId",
  "confirmationName",
  "name",
  "lastName",
  "allergies",
  "otherAllergies",
  "comments",
  "outboundBus",
  "returnBus",
  "menu",
  "createdAt",
  "updatedAt",
];

const GUESTS_COLUMNS = {
  guestId: 0,
  confirmationId: 1,
  confirmationName: 2,
  name: 3,
  lastname: 4,
  allergies: 5,
  otherAllergies: 6,
  comments: 7,
  outboundBus: 8,
  returnBus: 9,
  menu: 10,
  createdAt: 11,
  updatedAt: 12,
};

const TABLES_HEADERS = [
  "tableId",
  "name",
  "group",
  "tag",
  "shape",
  "seatCount",
  "notes",
  "createdAt",
  "updatedAt",
];

const TABLES_COLUMNS = {
  tableId: 0,
  name: 1,
  group: 2,
  tag: 3,
  shape: 4,
  seatCount: 5,
  notes: 6,
  createdAt: 7,
  updatedAt: 8,
};

const SEATS_HEADERS = [
  "seatId",
  "tableId",
  "seatNumber",
  "createdAt",
  "updatedAt",
];

const SEATS_COLUMNS = {
  seatId: 0,
  tableId: 1,
  seatNumber: 2,
  createdAt: 3,
  updatedAt: 4,
};

const TABLE_ASSIGNMENTS_HEADERS = [
  "assignmentId",
  "seatId",
  "tableId",
  "guestId",
  "confirmationId",
  "createdAt",
  "updatedAt",
];

const TABLE_ASSIGNMENTS_COLUMNS = {
  assignmentId: 0,
  seatId: 1,
  tableId: 2,
  guestId: 3,
  confirmationId: 4,
  createdAt: 5,
  updatedAt: 6,
};

const PROVIDERS_HEADERS = [
  "providerId",
  "name",
  "category",
  "phone",
  "email",
  "address",
  "web",
  "accountNumber",
  "active",
  "createdAt",
  "updatedAt",
];

const PROVIDERS_COLUMNS = {
  providerId: 0,
  name: 1,
  category: 2,
  phone: 3,
  email: 4,
  address: 5,
  web: 6,
  accountNumber: 7,
  active: 8,
  createdAt: 9,
  updatedAt: 10,
};

const PROVIDER_SERVICES_HEADERS = [
  "serviceId",
  "providerId",
  "name",
  "price",
  "paymentCount",
  "notes",
  "active",
  "createdAt",
  "updatedAt",
];

const PROVIDER_SERVICES_COLUMNS = {
  serviceId: 0,
  providerId: 1,
  name: 2,
  price: 3,
  paymentCount: 4,
  notes: 5,
  active: 6,
  createdAt: 7,
  updatedAt: 8,
};

const PROVIDER_PAYMENTS_HEADERS = [
  "paymentId",
  "serviceId",
  "paymentNumber",
  "amount",
  "dueDate",
  "paidDate",
  "paid",
  "notes",
  "createdAt",
  "updatedAt",
];

const PROVIDER_PAYMENTS_COLUMNS = {
  paymentId: 0,
  serviceId: 1,
  paymentNumber: 2,
  amount: 3,
  dueDate: 4,
  paidDate: 5,
  paid: 6,
  notes: 7,
  createdAt: 8,
  updatedAt: 9,
};

const NOTIFICATIONS_HEADERS = [
  "notificationId",
  "title",
  "detail",
  "date",
  "type",
  "read",
  "createdAt",
  "updatedAt",
];

const NOTIFICATIONS_COLUMNS = {
  notificationId: 0,
  title: 1,
  detail: 2,
  date: 3,
  type: 4,
  read: 5,
  createdAt: 6,
  updatedAt: 7,
};

const TASKS_HEADERS = [
  "taskId",
  "title",
  "description",
  "category",
  "maxDate",
  "priority",
  "responsible",
  "status",
  "createdAt",
  "updatedAt",
];

const TASKS_COLUMNS = {
  taskId: 0,
  title: 1,
  description: 2,
  category: 3,
  maxDate: 4,
  priority: 5,
  responsible: 6,
  status: 7,
  createdAt: 8,
  updatedAt: 9,
};

const MUSIC_SONGS_HEADERS = ["musicSongId", "momentId", "name", "title", "notes", "createdAt", "updatedAt"];
const MUSIC_SONGS_COLUMNS = { musicSongId: 0, momentId: 1, name: 2, title: 3, notes: 4, createdAt: 5, updatedAt: 6 };
const MUSIC_MOMENTS_HEADERS = ["momentId", "label", "description", "createdAt", "updatedAt"];
const MUSIC_MOMENTS_COLUMNS = { momentId: 0, label: 1, description: 2, createdAt: 3, updatedAt: 4 };
const MUSIC_BLOCKS_HEADERS = ["musicBlockId", "momentId", "name", "style", "duration", "createdAt", "updatedAt"];
const MUSIC_BLOCKS_COLUMNS = { musicBlockId: 0, momentId: 1, name: 2, style: 3, duration: 4, createdAt: 5, updatedAt: 6 };
const MUSIC_MOMENT_TEMPLATES = [
  ["guest-arrival", "Llegada de los invitados", "Música ambiental", "UsersRound"], ["groom-entrance", "Entrada del novio", "Canción elegida", "LogIn"], ["bride-entrance", "Entrada de la novia", "Canción principal", "Heart"], ["readings", "Lecturas", "Música suave (opcional)", "BookOpen"], ["rings", "Intercambio de alianzas", "Música instrumental", "Gem"], ["signing", "Firma de los documentos", "Canción elegida", "PenLine"], ["newlyweds-exit", "Salida de los novios", "Canción alegre", "DoorOpen"], ["cocktail", "Cóctel", "Playlist relajada", "GlassWater"], ["banquet-entrance", "Entrada al banquete", "Canción de presentación", "UtensilsCrossed"], ["salon-entrance", "Entrada de los novios al salón", "Canción especial", "Music"], ["cake", "Corte de la tarta", "Canción elegida", "CakeSlice"], ["first-dance", "Primer baile", "Canción de apertura", "Disc3"], ["open-bar", "Apertura de la barra libre", "Canción potente para arrancar la fiesta", "PartyPopper"], ["special-moments", "Momentos especiales (ramo, regalos, etc.)", "Canciones específicas", "Gift"], ["end-party", "Fin de la fiesta", "Última canción", "Flag"],
].map(([id, label, description, icon]) => ({ id, label, description, icon }));

const MUSIC_SAMPLE_SONGS = [
  { momentId: "guest-arrival", name: "Norah Jones", title: "Sunrise", notes: "Ambiental y suave" }, { momentId: "groom-entrance", name: "Coldplay", title: "Adventure of a Lifetime", notes: "Entrada del novio" }, { momentId: "bride-entrance", name: "Christina Perri", title: "A Thousand Years", notes: "Entrada principal" }, { momentId: "readings", name: "Yiruma", title: "River Flows in You", notes: "Bajar volumen durante las lecturas" }, { momentId: "rings", name: "Ludovico Einaudi", title: "Nuvole Bianche", notes: "Instrumental" }, { momentId: "signing", name: "Jason Mraz", title: "I'm Yours", notes: "Durante la firma" }, { momentId: "newlyweds-exit", name: "Katrina and the Waves", title: "Walking on Sunshine", notes: "Salida alegre" }, { momentId: "cocktail", name: "Jack Johnson", title: "Better Together", notes: "Inicio de la playlist" }, { momentId: "banquet-entrance", name: "The Black Eyed Peas", title: "I Gotta Feeling", notes: "Presentación al banquete" }, { momentId: "salon-entrance", name: "Bruno Mars", title: "Marry You", notes: "Entrada de los novios" }, { momentId: "cake", name: "OneRepublic", title: "I Lived", notes: "Corte de tarta" }, { momentId: "first-dance", name: "John Legend", title: "All of Me", notes: "Primer baile" }, { momentId: "open-bar", name: "Bruno Mars", title: "Uptown Funk", notes: "Arranque de fiesta" }, { momentId: "special-moments", name: "Beyoncé", title: "Single Ladies", notes: "Lanzamiento del ramo" }, { momentId: "end-party", name: "Queen", title: "Don't Stop Me Now", notes: "Última canción" },
];

function ensureHeader(sheet, headers) {
  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = headers.some(
    (header, index) => currentHeaders[index] !== header,
  );

  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function getTablesSheet() {
  return getOrCreateSheet(TABLES_SHEET_NAME, TABLES_HEADERS);
}

function getSeatsSheet() {
  return getOrCreateSheet(SEATS_SHEET_NAME, SEATS_HEADERS);
}

function getTableAssignmentsSheet() {
  return getOrCreateSheet(
    TABLE_ASSIGNMENTS_SHEET_NAME,
    TABLE_ASSIGNMENTS_HEADERS,
  );
}

function getProvidersSheet() {
  return getOrCreateSheet(PROVIDERS_SHEET_NAME, PROVIDERS_HEADERS);
}

function getProviderServicesSheet() {
  return getOrCreateSheet(
    PROVIDER_SERVICES_SHEET_NAME,
    PROVIDER_SERVICES_HEADERS,
  );
}

function getProviderPaymentsSheet() {
  return getOrCreateSheet(
    PROVIDER_PAYMENTS_SHEET_NAME,
    PROVIDER_PAYMENTS_HEADERS,
  );
}

function getNotificationsSheet() {
  return getOrCreateSheet(NOTIFICATIONS_SHEET_NAME, NOTIFICATIONS_HEADERS);
}

function getTasksSheet() {
  return getOrCreateSheet(TASKS_SHEET_NAME, TASKS_HEADERS);
}

function jsonResponse(obj, e) {
  const json = JSON.stringify(obj);
  const callback = e && e.parameter.callback;

  if (
    callback &&
    /^[a-zA-Z_$][0-9a-zA-Z_$]*(\.[a-zA-Z_$][0-9a-zA-Z_$]*)*$/.test(callback)
  ) {
    return ContentService.createTextOutput(`${callback}(${json});`).setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }

  return ContentService.createTextOutput(json).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function readParam(value) {
  return decodeURIComponent(value || "").trim();
}

function getMusicSongsSheet() {
  return getOrCreateSheet(MUSIC_SONGS_SHEET_NAME, MUSIC_SONGS_HEADERS);
}

function getMusicMomentsSheet() {
  return getOrCreateSheet(MUSIC_MOMENTS_SHEET_NAME, MUSIC_MOMENTS_HEADERS);
}
function getMusicBlocksSheet() { return getOrCreateSheet(MUSIC_BLOCKS_SHEET_NAME, MUSIC_BLOCKS_HEADERS); }

function validateRequestContract(data) {
  const version = data && data.contractVersion;

  return Number(version) === API_CONTRACT_VERSION
    ? ""
    : "Unsupported contract version";
}

function normalizeAdminPassword(value) {
  return String(value || "").trim();
}

function getAdminPassword() {
  const configuredPassword =
    PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD");

  return normalizeAdminPassword(configuredPassword);
}

function createEntityId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createSeatId(tableId, seatNumber) {
  return `${String(tableId || "").trim()}-seat-${String(seatNumber || "").trim()}`;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getBooleanScriptProperty(name, defaultValue) {
  const value = PropertiesService.getScriptProperties().getProperty(name);

  if (value == null || value === "") return Boolean(defaultValue);

  return ["1", "true", "yes", "on", "enabled", "si", "s"].includes(
    String(value).trim().toLowerCase(),
  );
}

function isMenuModuleEnabled() {
  return getBooleanScriptProperty("ENABLE_MENU_MODULE", false);
}

function decodeConfirmationName(value) {
  const text = String(value || "").trim();

  if (!text) return "";

  try {
    return Utilities.newBlob(Utilities.base64Decode(text))
      .getDataAsString("UTF-8")
      .trim();
  } catch (err) {
    return text;
  }
}

function encodeConfirmationName(value) {
  const text = String(value || "").trim();

  if (!text) return "";

  return Utilities.base64Encode(text, Utilities.Charset.UTF_8);
}

function encodeConfirmationForApi(confirmation) {
  const encodedConfirmationName = encodeConfirmationName(
    confirmation.confirmationName,
  );

  return {
    confirmationId: confirmation.confirmationId || "",
    id: confirmation.confirmationId || "",
    confirmationName: encodedConfirmationName,
    email: confirmation.email || "",
    phone: confirmation.phone || "",
    guests: (confirmation.guests || []).map((guest) => ({
      ...guest,
      confirmationId: confirmation.confirmationId || guest.confirmationId || "",
      guestId: guest.guestId || guest.id || "",
      id: guest.guestId || guest.id || "",
      confirmationName: encodedConfirmationName,
    })),
  };
}

function validateAdmin(e) {
  const password = normalizeAdminPassword(
    readParam(e.parameter.password || ""),
  );

  if (!password || password !== getAdminPassword()) {
    return jsonResponse(
      {
        success: false,
        error: "Unauthorized",
        confirmations: [],
      },
      e,
    );
  }

  return null;
}

function isAdminPayload(data) {
  const password = normalizeAdminPassword(data.password);

  return Boolean(password) && password === getAdminPassword();
}

function requireAdmin(data) {
  if (
    !normalizeAdminPassword(data.password) ||
    normalizeAdminPassword(data.password) !== getAdminPassword()
  ) {
    throw new Error("Unauthorized");
  }
}

function withWriteLock(callback) {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error("Another update is in progress. Please try again.");
  }

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function replaceSheetData(sheet, headers, rows) {
  const lastRow = sheet.getLastRow();
  const previousCount = Math.max(lastRow - 1, 0);

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  if (previousCount > rows.length) {
    sheet.deleteRows(rows.length + 2, previousCount - rows.length);
  }
}

function getSheetRowsById(sheet, idColumn) {
  const rows = sheet.getDataRange().getValues();
  const byId = {};

  for (let index = 1; index < rows.length; index++) {
    const id = String(rows[index][idColumn] || "").trim();

    if (id) byId[id] = rows[index];
  }

  return byId;
}

function normalizeAllergies(allergies) {
  if (!Array.isArray(allergies)) return "";

  return allergies.filter(Boolean).join(", ");
}

function parseAllergies(value) {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMenu(value) {
  const menu = String(value || "").trim();

  return menu === "Carne" || menu === "Pescado" ? menu : "";
}

function getNormalizedConfirmationData(data) {
  const confirmationName = decodeConfirmationName(data.confirmationName);
  const confirmationId = String(data.confirmationId || data.id || "").trim();

  return {
    confirmationId,
    confirmationName,
    email: String(data.email || "").trim(),
    phone: String(data.phone || "").trim(),
    guests: Array.isArray(data.guests)
      ? data.guests.map((guest) => ({
          ...guest,
          confirmationId,
          confirmationName,
        }))
      : [],
  };
}

function deleteGuestRows(sheet, confirmation) {
  const data = sheet.getDataRange().getValues();
  const confirmationId = String(confirmation.confirmationId || "")
    .trim()
    .toLowerCase();

  if (!confirmationId) return;

  for (let i = data.length - 1; i > 0; i--) {
    const rowConfirmationId = String(
      data[i][GUESTS_COLUMNS.confirmationId] || "",
    )
      .trim()
      .toLowerCase();

    if (rowConfirmationId === confirmationId) {
      sheet.deleteRow(i + 1);
    }
  }
}

function deleteConfirmationRow(sheet, confirmation) {
  const data = sheet.getDataRange().getValues();
  const confirmationId = String(confirmation.confirmationId || "")
    .trim()
    .toLowerCase();

  if (!confirmationId) return;

  for (let i = data.length - 1; i > 0; i--) {
    const rowConfirmationId = String(
      data[i][CONFIRMATIONS_COLUMNS.confirmationId] || "",
    )
      .trim()
      .toLowerCase();

    if (rowConfirmationId === confirmationId) {
      sheet.deleteRow(i + 1);
    }
  }
}

function buildConfirmationFromRow(row, guests) {
  return {
    confirmationId: row[CONFIRMATIONS_COLUMNS.confirmationId] || "",
    confirmationName: row[CONFIRMATIONS_COLUMNS.confirmationName] || "",
    email: row[CONFIRMATIONS_COLUMNS.email] || "",
    phone: row[CONFIRMATIONS_COLUMNS.phone] || "",
    guests: guests || [],
  };
}

function buildConfirmationRow(data) {
  const now = getCurrentTimestamp();

  return [
    data.confirmationId,
    data.confirmationName,
    data.email,
    data.phone,
    data.guests.length,
    data.createdAt || now,
    now,
  ];
}

function normalizeNotificationType(value) {
  const type = String(value || "").trim();

  if (type === "Pago" || type === "Invitados") return type;

  return "Aviso";
}

function normalizeNotificationDate(value) {
  const text = String(value || "").trim();

  if (text) return text;

  return new Date().toISOString().slice(0, 10);
}

function buildNotificationFromRow(row) {
  const notificationId = row[NOTIFICATIONS_COLUMNS.notificationId] || "";

  return {
    id: notificationId,
    notificationId,
    title: row[NOTIFICATIONS_COLUMNS.title] || "",
    detail: row[NOTIFICATIONS_COLUMNS.detail] || "",
    date: normalizeNotificationDate(row[NOTIFICATIONS_COLUMNS.date]),
    type: normalizeNotificationType(row[NOTIFICATIONS_COLUMNS.type]),
    read: isTruthySheetValue(row[NOTIFICATIONS_COLUMNS.read]),
  };
}

function buildNotificationRow(notification) {
  const now = getCurrentTimestamp();
  const notificationId =
    String(notification.notificationId || notification.id || "").trim() ||
    createEntityId("notification");

  return [
    notificationId,
    String(notification.title || "").trim(),
    String(notification.detail || "").trim(),
    normalizeNotificationDate(notification.date),
    normalizeNotificationType(notification.type),
    Boolean(notification.read),
    notification.createdAt || now,
    now,
  ];
}

function normalizeTaskCategory(value) {
  const category = String(value || "")
    .trim()
    .toLowerCase();
  const validCategories = [
    "ceremonia",
    "novios",
    "fotografia",
    "video",
    "banquete",
    "invitados",
    "transporte",
    "mesas",
    "fiesta",
    "decoracion",
    "pagos",
    "otros",
  ];

  return validCategories.indexOf(category) >= 0 ? category : "ceremonia";
}

function normalizeTaskPriority(value) {
  const priority = String(value || "")
    .trim()
    .toLowerCase();

  if (priority === "alta" || priority === "media" || priority === "baja") {
    return priority;
  }

  return "media";
}

function normalizeTaskStatus(value) {
  const status = String(value || "")
    .trim()
    .toLowerCase();

  if (status === "completed" || status === "completa") return "completed";

  return "pending";
}

function buildTaskFromRow(row) {
  const taskId = row[TASKS_COLUMNS.taskId] || "";

  return {
    id: taskId,
    taskId,
    title: row[TASKS_COLUMNS.title] || "",
    description: row[TASKS_COLUMNS.description] || "",
    category: normalizeTaskCategory(row[TASKS_COLUMNS.category]),
    maxDate: row[TASKS_COLUMNS.maxDate] || "",
    priority: normalizeTaskPriority(row[TASKS_COLUMNS.priority]),
    responsible: row[TASKS_COLUMNS.responsible] || "",
    status: normalizeTaskStatus(row[TASKS_COLUMNS.status]),
  };
}

function buildTaskRow(task) {
  const now = getCurrentTimestamp();
  const taskId =
    String(task.taskId || task.id || "").trim() || createEntityId("task");

  return [
    taskId,
    String(task.title || "").trim(),
    String(task.description || "").trim(),
    normalizeTaskCategory(task.category),
    String(task.maxDate || "").trim(),
    normalizeTaskPriority(task.priority),
    String(task.responsible || "").trim(),
    normalizeTaskStatus(task.status),
    task.createdAt || now,
    now,
  ];
}

function appendNotification(notification) {
  const sheet = getNotificationsSheet();

  sheet.appendRow(buildNotificationRow(notification));
}

function createConfirmationNotification(confirmation, guests, action) {
  const guestNames = (guests || [])
    .map((guest) => `${guest.name || ""} ${guest.lastname || ""}`.trim())
    .filter(Boolean)
    .join(", ");
  const contactParts = [
    confirmation.email ? `Email: ${confirmation.email}` : "",
    confirmation.phone ? `Telefono: ${confirmation.phone}` : "",
    guestNames ? `Invitados: ${guestNames}` : "",
  ].filter(Boolean);

  appendNotification({
    title: getConfirmationNotificationTitle(confirmation, action),
    detail: contactParts.join(" | "),
    date: normalizeNotificationDate(),
    type: "Invitados",
    read: false,
  });
}

function getConfirmationNotificationTitle(confirmation, action) {
  const name = confirmation.confirmationName || "Sin nombre";

  if (action === "deleted") return `Confirmación eliminada: ${name}`;
  if (action === "updated") return `Confirmación actualizada: ${name}`;

  return `Confirmación recibida: ${name}`;
}

function validateUniqueConfirmationContact(confirmation) {
  const rows = getConfirmationsSheet().getDataRange().getDisplayValues();
  const confirmationId = String(confirmation.confirmationId || "")
    .trim()
    .toLowerCase();
  const email = String(confirmation.email || "")
    .trim()
    .toLowerCase();
  const phone = normalizePhoneSearch(confirmation.phone);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowConfirmationId = String(
      row[CONFIRMATIONS_COLUMNS.confirmationId] || "",
    )
      .trim()
      .toLowerCase();

    if (confirmationId && rowConfirmationId === confirmationId) continue;

    const rowEmail = String(row[CONFIRMATIONS_COLUMNS.email] || "")
      .trim()
      .toLowerCase();
    const rowPhone = normalizePhoneSearch(row[CONFIRMATIONS_COLUMNS.phone]);

    if (email && rowEmail === email) {
      throw new Error("Duplicated confirmation email");
    }

    if (phone && rowPhone === phone) {
      throw new Error("Duplicated confirmation phone");
    }
  }
}

function buildGuestFromRow(row, confirmation, assignmentContext) {
  const confirmationName =
    row[GUESTS_COLUMNS.confirmationName] || confirmation.confirmationName || "";
  const confirmationId =
    row[GUESTS_COLUMNS.confirmationId] || confirmation.confirmationId || "";
  const guestId = row[GUESTS_COLUMNS.guestId] || "";
  const assignment = assignmentContext?.assignmentsByGuestId?.[guestId] || null;
  const table = assignment
    ? assignmentContext?.tablesById?.[assignment.tableId] || null
    : null;
  const seat = assignment
    ? assignmentContext?.seatsById?.[assignment.seatId] || null
    : null;

  return {
    confirmationId,
    guestId,
    id: guestId,
    confirmationName,
    email: confirmation.email || "",
    phone: confirmation.phone || "",
    name: row[GUESTS_COLUMNS.name] || "",
    lastname: row[GUESTS_COLUMNS.lastname] || "",
    allergies: parseAllergies(row[GUESTS_COLUMNS.allergies]),
    otherAllergies: row[GUESTS_COLUMNS.otherAllergies] || "",
    comments: row[GUESTS_COLUMNS.comments] || "",
    outboundBus: row[GUESTS_COLUMNS.outboundBus] || "No",
    returnBus: row[GUESTS_COLUMNS.returnBus] || "No",
    menu: normalizeMenu(row[GUESTS_COLUMNS.menu]),
    tableId: assignment?.tableId || "",
    table: table?.name || "",
    seat: seat?.seatNumber || "",
  };
}

function buildGuestRow(data, guest) {
  const now = getCurrentTimestamp();
  const guestId =
    String(guest.guestId || guest.id || "").trim() || createEntityId("guest");

  return [
    guestId,
    data.confirmationId,
    data.confirmationName,
    guest.name,
    guest.lastname,
    normalizeAllergies(guest.allergies),
    guest.otherAllergies || "",
    guest.comments || "",
    guest.outboundBus || "No",
    guest.returnBus || "No",
    normalizeMenu(guest.menu),
    guest.createdAt || now,
    now,
  ];
}

function normalizeTableShape(value) {
  const shape = String(value || "").trim();

  return shape === "round" || shape === "rectangular" ? shape : "rectangular";
}

function buildTableFromRow(row) {
  const name = row[TABLES_COLUMNS.name] || "";

  return {
    id: row[TABLES_COLUMNS.tableId] || "",
    tableId: row[TABLES_COLUMNS.tableId] || "",
    name,
    group: row[TABLES_COLUMNS.group] || row[TABLES_COLUMNS.tag] || "",
    tag: row[TABLES_COLUMNS.tag] || row[TABLES_COLUMNS.group] || "",
    shape: normalizeTableShape(row[TABLES_COLUMNS.shape]),
    seatCount: Math.max(Number(row[TABLES_COLUMNS.seatCount]) || 0, 0),
    notes: row[TABLES_COLUMNS.notes] || "",
  };
}

function buildSeatFromRow(row) {
  return {
    seatId: row[SEATS_COLUMNS.seatId] || "",
    tableId: row[SEATS_COLUMNS.tableId] || "",
    seatNumber: row[SEATS_COLUMNS.seatNumber] || "",
  };
}

function buildAssignmentFromRow(row) {
  return {
    assignmentId: row[TABLE_ASSIGNMENTS_COLUMNS.assignmentId] || "",
    seatId: row[TABLE_ASSIGNMENTS_COLUMNS.seatId] || "",
    tableId: row[TABLE_ASSIGNMENTS_COLUMNS.tableId] || "",
    guestId: row[TABLE_ASSIGNMENTS_COLUMNS.guestId] || "",
    confirmationId: row[TABLE_ASSIGNMENTS_COLUMNS.confirmationId] || "",
  };
}

function buildAssignmentContext() {
  const tablesRows = getTablesSheet().getDataRange().getDisplayValues();
  const seatsRows = getSeatsSheet().getDataRange().getDisplayValues();
  const assignmentRows = getTableAssignmentsSheet()
    .getDataRange()
    .getDisplayValues();
  const tablesById = {};
  const tablesByName = {};
  const seatsById = {};
  const seatsByTableAndNumber = {};
  const assignmentsByGuestId = {};

  for (let i = 1; i < tablesRows.length; i++) {
    const table = buildTableFromRow(tablesRows[i]);

    if (!table.tableId) continue;

    tablesById[table.tableId] = table;
    if (table.name)
      tablesByName[String(table.name).trim().toLowerCase()] = table;
  }

  for (let i = 1; i < seatsRows.length; i++) {
    const seat = buildSeatFromRow(seatsRows[i]);

    if (!seat.seatId) continue;

    seatsById[seat.seatId] = seat;
    seatsByTableAndNumber[`${seat.tableId}|${seat.seatNumber}`] = seat;
  }

  for (let i = 1; i < assignmentRows.length; i++) {
    const assignment = buildAssignmentFromRow(assignmentRows[i]);

    if (!assignment.guestId || !assignment.tableId || !assignment.seatId)
      continue;

    assignmentsByGuestId[assignment.guestId] = assignment;
  }

  return {
    assignmentsByGuestId,
    seatsById,
    seatsByTableAndNumber,
    tablesById,
    tablesByName,
  };
}

function deleteAssignmentsByConfirmationId(sheet, confirmationId) {
  const data = sheet.getDataRange().getValues();
  const normalizedConfirmationId = String(confirmationId || "")
    .trim()
    .toLowerCase();

  if (!normalizedConfirmationId) return;

  for (let i = data.length - 1; i > 0; i--) {
    const rowConfirmationId = String(
      data[i][TABLE_ASSIGNMENTS_COLUMNS.confirmationId] || "",
    )
      .trim()
      .toLowerCase();

    if (rowConfirmationId === normalizedConfirmationId) {
      sheet.deleteRow(i + 1);
    }
  }
}

function appendAssignmentRowsForGuests(sheet, confirmation, guests) {
  const context = buildAssignmentContext();
  const rows = buildAssignmentRowsForGuests(confirmation, guests, context);

  if (rows.length) {
    sheet
      .getRange(
        sheet.getLastRow() + 1,
        1,
        rows.length,
        TABLE_ASSIGNMENTS_HEADERS.length,
      )
      .setValues(rows);
  }
}

function buildMusicSongFromRow(row) {
  const musicSongId = row[MUSIC_SONGS_COLUMNS.musicSongId] || "";
  return { id: musicSongId, musicSongId, momentId: row[MUSIC_SONGS_COLUMNS.momentId] || "", name: row[MUSIC_SONGS_COLUMNS.name] || "", title: row[MUSIC_SONGS_COLUMNS.title] || "", notes: row[MUSIC_SONGS_COLUMNS.notes] || "" };
}

function buildMusicSongRow(song) {
  const now = getCurrentTimestamp();
  const musicSongId = String(song.musicSongId || song.id || "").trim() || createEntityId("music");
  return [musicSongId, String(song.momentId || "").trim(), String(song.name || "").trim(), String(song.title || "").trim(), String(song.notes || song.link || "").trim(), song.createdAt || now, now];
}

function buildMusicMomentFromRow(row) { const momentId = row[MUSIC_MOMENTS_COLUMNS.momentId] || ""; return { id: momentId, momentId, label: row[MUSIC_MOMENTS_COLUMNS.label] || "", description: row[MUSIC_MOMENTS_COLUMNS.description] || "" }; }
function buildMusicMomentRow(moment) { const now = getCurrentTimestamp(); const momentId = String(moment.momentId || moment.id || "").trim() || createEntityId("moment"); return [momentId, String(moment.label || "").trim(), String(moment.description || "").trim(), moment.createdAt || now, now]; }
function buildMusicBlockFromRow(row) { const musicBlockId = row[MUSIC_BLOCKS_COLUMNS.musicBlockId] || ""; return { id: musicBlockId, musicBlockId, momentId: row[MUSIC_BLOCKS_COLUMNS.momentId] || "", name: row[MUSIC_BLOCKS_COLUMNS.name] || "", style: row[MUSIC_BLOCKS_COLUMNS.style] || "", duration: row[MUSIC_BLOCKS_COLUMNS.duration] || "" }; }
function buildMusicBlockRow(block) { const now = getCurrentTimestamp(); const id = String(block.musicBlockId || block.id || "").trim() || createEntityId("block"); return [id, String(block.momentId || "").trim(), String(block.name || "").trim(), String(block.style || "").trim(), String(block.duration || "").trim(), block.createdAt || now, now]; }

function buildAssignmentRowsForGuests(confirmation, guests, context) {
  const rows = [];
  const now = getCurrentTimestamp();

  guests.forEach((guest) => {
    const guestId = String(guest.guestId || guest.id || "").trim();
    const rawTableId = String(guest.tableId || "").trim();
    const tableName = String(guest.table || "")
      .trim()
      .toLowerCase();
    const table = rawTableId
      ? context.tablesById[rawTableId]
      : context.tablesByName[tableName];
    const tableId = table?.tableId || rawTableId;
    const seatNumber = String(guest.seat || "").trim();
    const seat = context.seatsByTableAndNumber[`${tableId}|${seatNumber}`];

    if (!guestId || !tableId || !seatNumber || !seat) return;

    rows.push([
      `${tableId}-${seat.seatId}-${guestId}`,
      seat.seatId,
      tableId,
      guestId,
      confirmation.confirmationId,
      guest.assignmentCreatedAt || now,
      now,
    ]);
  });

  return rows;
}

function cleanAssignmentsOutsideValidSeats(sheet, validTableIds, validSeatIds) {
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i > 0; i--) {
    const tableId = String(
      data[i][TABLE_ASSIGNMENTS_COLUMNS.tableId] || "",
    ).trim();
    const seatId = String(
      data[i][TABLE_ASSIGNMENTS_COLUMNS.seatId] || "",
    ).trim();

    if (!validTableIds.has(tableId) || !validSeatIds.has(seatId)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function deleteAllTableRows(sheet) {
  deleteDataRows(sheet);
}

function deleteDataRows(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function isTruthySheetValue(value) {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  return (
    value === true ||
    text === "true" ||
    text === "si" ||
    text === "s" ||
    text === "1"
  );
}

function isActiveSheetValue(value) {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  return !text || isTruthySheetValue(value);
}

function getProviderTimestamp(value, fallback) {
  return String(value || fallback || new Date().toISOString());
}
