const SEAT_COLUMNS = ["A", "B", "C", "D", "E", "F"];

export function generateSeat() {
  const row = Math.floor(Math.random() * 30) + 1;
  const column = SEAT_COLUMNS[Math.floor(Math.random() * SEAT_COLUMNS.length)];

  return `${row}${column}`;
}
