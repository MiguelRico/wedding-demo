/* eslint-disable */
function routePut(data) {
  const entity = getRequestEntity(data);

  if (entity === "confirmations") return saveConfirmation(data);
  if (entity === "tables") return saveTables(data);
  if (entity === "providers") return saveProviders(data);
  if (entity === "notifications") return saveNotifications(data);
  if (entity === "tasks") return saveTasks(data);
  if (entity === "music") return saveMusic(data);
  if (entity === "tablePlan") return saveTablePlan(data);
  if (entity === "notificationRead") return updateNotificationRead(data);

  throw new Error("Resource not supported");
}

function saveTablePlan(data) {
  requireAdmin(data);

  const tables = Array.isArray(data.tables) ? data.tables : [];
  const confirmations = Array.isArray(data.confirmations)
    ? data.confirmations
    : [];

  tables.forEach((table) => {
    if (!String(table.name || "").trim()) {
      throw new Error("Cada mesa debe tener nombre");
    }
  });
  confirmations.forEach((confirmation) => {
    if (!String(confirmation.confirmationId || confirmation.id || "").trim()) {
      throw new Error("Cada confirmación debe tener identificador");
    }
  });

  const snapshots = [
    [getTablesSheet(), TABLES_HEADERS],
    [getSeatsSheet(), SEATS_HEADERS],
    [getTableAssignmentsSheet(), TABLE_ASSIGNMENTS_HEADERS],
    [getConfirmationsSheet(), CONFIRMATIONS_HEADERS],
    [getSheet(), GUESTS_HEADERS],
  ].map(([sheet, headers]) => ({
    headers,
    rows: sheet.getDataRange().getValues().slice(1),
    sheet,
  }));

  try {
    saveTables({ ...data, tables });
    confirmations.forEach((confirmation) =>
      saveConfirmation({ ...confirmation, entity: "confirmations", password: data.password }),
    );
  } catch (error) {
    snapshots.forEach(({ headers, rows, sheet }) =>
      replaceSheetData(sheet, headers, rows),
    );
    throw error;
  }

  return jsonResponse({
    confirmations: confirmations.length,
    success: true,
    tables: tables.length,
  });
}

function saveConfirmation(data) {
  const confirmationsSheet = getConfirmationsSheet();
  const guestsSheet = getSheet();
  const assignmentsSheet = getTableAssignmentsSheet();
  const confirmation = getNormalizedConfirmationData(data);

  if (!confirmation.confirmationName) throw new Error("Missing confirmationName");
  if (!confirmation.confirmationId) confirmation.confirmationId = createEntityId("confirmation");

  const confirmationRows = confirmationsSheet.getDataRange().getValues();
  const confirmationId = confirmation.confirmationId.toLowerCase();
  let existingConfirmationRow = null;
  validateUniqueConfirmationContactFromRows(confirmation, confirmationRows);

  const keptConfirmationRows = confirmationRows.slice(1).filter((row) => {
    const matches = String(row[CONFIRMATIONS_COLUMNS.confirmationId] || "").trim().toLowerCase() === confirmationId;
    if (matches) existingConfirmationRow = row;
    return !matches;
  });
  const isExistingConfirmation = Boolean(existingConfirmationRow);
  confirmation.createdAt = existingConfirmationRow?.[CONFIRMATIONS_COLUMNS.createdAt] || confirmation.createdAt;

  const guestsWithIds = confirmation.guests.map((guest) => ({
    ...guest,
    guestId: String(guest.guestId || guest.id || "").trim() || createEntityId("guest"),
    confirmationId: confirmation.confirmationId,
    confirmationName: confirmation.confirmationName,
  }));
  const existingGuestsById = getSheetRowsById(guestsSheet, GUESTS_COLUMNS.guestId);
  const guestRows = guestsSheet.getDataRange().getValues().slice(1).filter(
    (row) => String(row[GUESTS_COLUMNS.confirmationId] || "").trim().toLowerCase() !== confirmationId,
  );
  guestsWithIds.forEach((guest) => {
    guest.createdAt = existingGuestsById[guest.guestId]?.[GUESTS_COLUMNS.createdAt] || guest.createdAt;
    guestRows.push(buildGuestRow(confirmation, guest));
  });

  const assignmentRows = assignmentsSheet.getDataRange().getValues().slice(1).filter(
    (row) => String(row[TABLE_ASSIGNMENTS_COLUMNS.confirmationId] || "").trim().toLowerCase() !== confirmationId,
  );
  const assignmentContext = buildAssignmentContext();
  assignmentRows.push(...buildAssignmentRowsForGuests(confirmation, guestsWithIds, assignmentContext));

  keptConfirmationRows.push(buildConfirmationRow(confirmation));
  replaceSheetData(confirmationsSheet, CONFIRMATIONS_HEADERS, keptConfirmationRows);
  replaceSheetData(guestsSheet, GUESTS_HEADERS, guestRows);
  replaceSheetData(assignmentsSheet, TABLE_ASSIGNMENTS_HEADERS, assignmentRows);

  if (!isAdminPayload(data)) {
    sendConfirmationEmail(confirmation.email, confirmation.confirmationName, guestsWithIds, confirmation.confirmationId);
    sendAdminNotification(confirmation.confirmationName, confirmation.email, confirmation.phone, guestsWithIds);
    createConfirmationNotification(confirmation, guestsWithIds, isExistingConfirmation ? "updated" : "created");
  }

  return jsonResponse({ success: true, confirmationId: confirmation.confirmationId, confirmationName: encodeConfirmationName(confirmation.confirmationName) });
}

function validateUniqueConfirmationContactFromRows(confirmation, rows) {
  const confirmationId = String(confirmation.confirmationId || "").trim().toLowerCase();
  const email = String(confirmation.email || "").trim().toLowerCase();
  const phone = normalizePhoneSearch(confirmation.phone);
  rows.slice(1).forEach((row) => {
    if (String(row[CONFIRMATIONS_COLUMNS.confirmationId] || "").trim().toLowerCase() === confirmationId) return;
    if (email && String(row[CONFIRMATIONS_COLUMNS.email] || "").trim().toLowerCase() === email) throw new Error("Duplicated confirmation email");
    if (phone && normalizePhoneSearch(row[CONFIRMATIONS_COLUMNS.phone]) === phone) throw new Error("Duplicated confirmation phone");
  });
}

function saveTables(data) {
  requireAdmin(data);
  const tablesSheet = getTablesSheet();
  const seatsSheet = getSeatsSheet();
  const assignmentsSheet = getTableAssignmentsSheet();
  const previousTables = getSheetRowsById(tablesSheet, TABLES_COLUMNS.tableId);
  const previousSeats = getSheetRowsById(seatsSheet, SEATS_COLUMNS.seatId);
  const tableRows = [];
  const seatRows = [];
  const validTableIds = new Set();
  const validSeatIds = new Set();
  const now = getCurrentTimestamp();

  (Array.isArray(data.tables) ? data.tables : []).forEach((table) => {
    const tableId = String(table.tableId || table.id || "").trim() || createEntityId("table");
    const name = String(table.name || "").trim();
    const seatCount = Math.max(Number(table.seatCount) || Number(table.seats && table.seats.length) || 0, 0);
    if (!name) return;
    validTableIds.add(tableId);
    tableRows.push([tableId, name, String(table.group || table.tag || "").trim(), String(table.tag || table.group || "").trim(), normalizeTableShape(table.shape), seatCount, table.notes || "", previousTables[tableId]?.[TABLES_COLUMNS.createdAt] || table.createdAt || now, now]);
    for (let index = 1; index <= seatCount; index++) {
      const seatId = createSeatId(tableId, index);
      validSeatIds.add(seatId);
      seatRows.push([seatId, tableId, String(index), previousSeats[seatId]?.[SEATS_COLUMNS.createdAt] || table.createdAt || now, now]);
    }
  });
  const assignmentRows = assignmentsSheet.getDataRange().getValues().slice(1).filter((row) => validTableIds.has(String(row[TABLE_ASSIGNMENTS_COLUMNS.tableId] || "").trim()) && validSeatIds.has(String(row[TABLE_ASSIGNMENTS_COLUMNS.seatId] || "").trim()));
  replaceSheetData(tablesSheet, TABLES_HEADERS, tableRows);
  replaceSheetData(seatsSheet, SEATS_HEADERS, seatRows);
  replaceSheetData(assignmentsSheet, TABLE_ASSIGNMENTS_HEADERS, assignmentRows);
  return jsonResponse({ success: true, tables: tableRows.length });
}

function saveProviders(data) {
  requireAdmin(data);
  const providersSheet = getProvidersSheet();
  const servicesSheet = getProviderServicesSheet();
  const paymentsSheet = getProviderPaymentsSheet();
  const previousProviders = getSheetRowsById(providersSheet, PROVIDERS_COLUMNS.providerId);
  const previousServices = getSheetRowsById(servicesSheet, PROVIDER_SERVICES_COLUMNS.serviceId);
  const previousPayments = getSheetRowsById(paymentsSheet, PROVIDER_PAYMENTS_COLUMNS.paymentId);
  const providerRows = [], serviceRows = [], paymentRows = [];
  const now = getCurrentTimestamp();
  (Array.isArray(data.providers) ? data.providers : []).forEach((provider) => {
    const providerId = String(provider.providerId || provider.id || "").trim();
    if (!providerId) return;
    providerRows.push([providerId, provider.name || "", provider.category || "", provider.phone || "", provider.email || "", provider.address || "", provider.web || "", provider.accountNumber || "", true, previousProviders[providerId]?.[PROVIDERS_COLUMNS.createdAt] || getProviderTimestamp(provider.createdAt, now), now]);
    (Array.isArray(provider.services) ? provider.services : []).forEach((service) => {
      const serviceId = String(service.serviceId || service.id || "").trim();
      if (!serviceId) return;
      const paymentCount = Math.min(Math.max(Number(service.paymentCount) || 1, 1), 3);
      serviceRows.push([serviceId, providerId, service.name || "", service.price || "", paymentCount, service.notes || "", true, previousServices[serviceId]?.[PROVIDER_SERVICES_COLUMNS.createdAt] || getProviderTimestamp(service.createdAt, now), now]);
      (Array.isArray(service.payments) ? service.payments : []).slice(0, paymentCount).forEach((payment, index) => {
        const paymentId = payment.paymentId || payment.id || `${serviceId}-payment-${index + 1}`;
        paymentRows.push([paymentId, serviceId, index + 1, payment.amount || "", payment.date || "", payment.paid ? payment.date || "" : "", Boolean(payment.paid), payment.notes || "", previousPayments[paymentId]?.[PROVIDER_PAYMENTS_COLUMNS.createdAt] || getProviderTimestamp(payment.createdAt, now), now]);
      });
    });
  });
  replaceSheetData(providersSheet, PROVIDERS_HEADERS, providerRows);
  replaceSheetData(servicesSheet, PROVIDER_SERVICES_HEADERS, serviceRows);
  replaceSheetData(paymentsSheet, PROVIDER_PAYMENTS_HEADERS, paymentRows);
  return jsonResponse({ success: true, providers: providerRows.length, services: serviceRows.length, payments: paymentRows.length });
}

function saveNotifications(data) {
  requireAdmin(data);
  const sheet = getNotificationsSheet();
  const previous = getSheetRowsById(sheet, NOTIFICATIONS_COLUMNS.notificationId);
  const rows = (Array.isArray(data.notifications) ? data.notifications : []).map((notification) => {
    const id = String(notification.notificationId || notification.id || "").trim();
    return buildNotificationRow({ ...notification, createdAt: previous[id]?.[NOTIFICATIONS_COLUMNS.createdAt] || notification.createdAt });
  });
  replaceSheetData(sheet, NOTIFICATIONS_HEADERS, rows);
  return jsonResponse({ success: true, notifications: rows.length });
}

function saveTasks(data) {
  requireAdmin(data);
  const sheet = getTasksSheet();
  const previous = getSheetRowsById(sheet, TASKS_COLUMNS.taskId);
  const rows = (Array.isArray(data.tasks) ? data.tasks : []).map((task) => {
    const id = String(task.taskId || task.id || "").trim();
    return buildTaskRow({ ...task, createdAt: previous[id]?.[TASKS_COLUMNS.createdAt] || task.createdAt });
  });
  replaceSheetData(sheet, TASKS_HEADERS, rows);
  return jsonResponse({ success: true, tasks: rows.length });
}

function saveMusic(data) {
  requireAdmin(data);
  const sheet = getMusicSongsSheet();
  const previous = getSheetRowsById(sheet, MUSIC_SONGS_COLUMNS.musicSongId);
  const rows = (Array.isArray(data.music) ? data.music : []).map((song) => {
    const id = String(song.musicSongId || song.id || "").trim();
    return buildMusicSongRow({ ...song, createdAt: previous[id]?.[MUSIC_SONGS_COLUMNS.createdAt] || song.createdAt });
  });
  replaceSheetData(sheet, MUSIC_SONGS_HEADERS, rows);
  return jsonResponse({ success: true, music: rows.length });
}

function updateNotificationRead(data) {
  requireAdmin(data);
  const notificationId = String(data.notificationId || data.id || "").trim();
  if (!notificationId) throw new Error("Missing notificationId");
  const sheet = getNotificationsSheet();
  const rows = sheet.getDataRange().getValues();
  for (let index = 1; index < rows.length; index++) {
    if (String(rows[index][NOTIFICATIONS_COLUMNS.notificationId] || "").trim() !== notificationId) continue;
    rows[index][NOTIFICATIONS_COLUMNS.read] = Boolean(data.read);
    rows[index][NOTIFICATIONS_COLUMNS.updatedAt] = getCurrentTimestamp();
    sheet.getRange(index + 1, 1, 1, NOTIFICATIONS_HEADERS.length).setValues([rows[index]]);
    return jsonResponse({ success: true, notificationId, read: Boolean(data.read) });
  }
  throw new Error("Notification not found");
}
