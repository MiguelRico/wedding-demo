import { Guest } from "../models";

export function getTableRenderKey(table) {
  const seatSignature = (table.seats || [])
    .map((seat) => {
      const guestName = seat.guest ? Guest.getFullName(seat.guest) : "";

      return `${seat.seat}:${guestName}`;
    })
    .join(",");

  return `${table.name}-${seatSignature}`;
}

