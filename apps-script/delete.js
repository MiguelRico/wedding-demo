/* eslint-disable */
function routeDelete(data) {
  const entity = getRequestEntity(data);

  if (entity === "confirmations") {
    return deleteConfirmation(data);
  }

  throw new Error("Resource not supported");
}

function deleteConfirmation(data) {
  requireAdmin(data);

  const confirmationsSheet = getConfirmationsSheet();
  const guestsSheet = getSheet();
  const assignmentsSheet = getTableAssignmentsSheet();
  const confirmationId = String(data.confirmationId || data.id || "").trim();

  if (!confirmationId) {
    throw new Error("Missing confirmationId");
  }

  const normalizedConfirmationId = confirmationId.toLowerCase();
  const filterRows = (sheet, column) =>
    sheet
      .getDataRange()
      .getValues()
      .slice(1)
      .filter(
        (row) =>
          String(row[column] || "").trim().toLowerCase() !==
          normalizedConfirmationId,
      );

  replaceSheetData(
    confirmationsSheet,
    CONFIRMATIONS_HEADERS,
    filterRows(confirmationsSheet, CONFIRMATIONS_COLUMNS.confirmationId),
  );
  replaceSheetData(
    guestsSheet,
    GUESTS_HEADERS,
    filterRows(guestsSheet, GUESTS_COLUMNS.confirmationId),
  );
  replaceSheetData(
    assignmentsSheet,
    TABLE_ASSIGNMENTS_HEADERS,
    filterRows(assignmentsSheet, TABLE_ASSIGNMENTS_COLUMNS.confirmationId),
  );

  return jsonResponse({
    success: true,
    confirmationId,
  });
}
