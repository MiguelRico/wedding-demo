import { Confirmation } from "@/models";

const normalizeString = (value) => String(value || "").trim();
const sortByStableJson = (left, right) =>
  stableJson(left).localeCompare(stableJson(right));

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (!value || typeof value !== "object") return JSON.stringify(value);

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(",")}}`;
};
export const sameFingerprint = (left, right) =>
  stableJson(left) === stableJson(right);

export const getConfirmationComparable = (confirmationInput) => {
  const confirmation = Confirmation.normalize(confirmationInput);

  return {
    confirmationName: normalizeString(confirmation.confirmationName),
    email: normalizeString(confirmation.email).toLowerCase(),
    guests: confirmation.guests
      .map((guest) => ({
        allergies: (guest.allergies || []).map(normalizeString).sort(),
        comments: normalizeString(guest.comments),
        firstName: normalizeString(guest.name || guest.firstName),
        lastName: normalizeString(guest.lastname || guest.lastName),
        menu: normalizeString(guest.menu),
        otherAllergies: normalizeString(guest.otherAllergies),
        outboundBus: normalizeString(guest.outboundBus),
        returnBus: normalizeString(guest.returnBus),
        seat: normalizeString(guest.seat),
        table: normalizeString(guest.table),
        tableId: normalizeString(guest.tableId),
      }))
      .sort(sortByStableJson),
    phone: normalizeString(confirmation.phone),
  };
};
