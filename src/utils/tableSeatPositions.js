import { TABLE_SHAPES } from "../constants/tables";

export function getRectangularSeatPositions(seats) {
  const topCount = Math.ceil(seats.length / 2);
  const bottomCount = seats.length - topCount;

  return [
    ...seats.slice(0, topCount).map((seat, index) => ({
      seat,
      x: getJustifiedPosition(index, topCount, 22, 78),
      y: 24,
    })),
    ...seats.slice(topCount).map((seat, index) => ({
      seat,
      x: getJustifiedPosition(index, bottomCount, 22, 78),
      y: 76,
    })),
  ];
}

export function getRoundSeatPositions(seats) {
  const angleStep = (Math.PI * 2) / seats.length;

  return seats.map((seat, index) => ({
    seat,
    angle: -Math.PI / 2 + index * angleStep,
  }));
}

export function getTableSeatPositions(table) {
  const seats = table.seats || [];

  return table.shape === TABLE_SHAPES.round
    ? getRoundSeatPositions(seats)
    : getRectangularSeatPositions(seats);
}

function getJustifiedPosition(index, count, min, max) {
  if (count <= 1) return 50;

  return min + ((index + 1) / (count + 1)) * (max - min);
}
