import crypto from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateBookingReference() {
  let suffix = "";

  while (suffix.length < 6) {
    const randomIndex = crypto.randomInt(0, ALPHABET.length);
    suffix += ALPHABET[randomIndex];
  }

  return `FL-${suffix}`;
}

export function normalizeBookingReference(reference: string) {
  return reference.trim().toUpperCase();
}
