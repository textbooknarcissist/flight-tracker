import { BookingStatusLabel, CreateBookingRequest, UpdateBookingStatusRequest } from "../types/api";
import { AppError } from "../middleware/errorHandler";
import { normalizeBookingReference } from "./reference";

const NAME_PATTERN = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const AIRPORT_PATTERN = /^[A-Z]{3}$/;
const GATE_PATTERN = /^[A-Z0-9-]{1,5}$/;
const BOOKING_REFERENCE_PATTERN = /^FL-[A-Z0-9]{6}$/;
const STATUS_LABELS: BookingStatusLabel[] = ["Scheduled", "Delayed", "En Route", "Landed"];

function ensureObject(value: unknown, message: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(message, 400);
  }

  return value as Record<string, unknown>;
}

function assertString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${field} is required.`, 400);
  }

  return value.trim();
}

export function validateCreateBookingPayload(payload: unknown): CreateBookingRequest {
  const body = ensureObject(payload, "Booking payload must be an object.");
  const firstName = assertString(body.firstName, "firstName");
  const lastName = assertString(body.lastName, "lastName");
  const email = assertString(body.email, "email").toLowerCase();
  const phone = assertString(body.phone, "phone");
  const departureAirport = assertString(body.departureAirport, "departureAirport").toUpperCase();
  const arrivalAirport = assertString(body.arrivalAirport, "arrivalAirport").toUpperCase();
  const departureDate = assertString(body.departureDate, "departureDate");

  if (!NAME_PATTERN.test(firstName) || !NAME_PATTERN.test(lastName)) {
    throw new AppError("Passenger names may only contain letters, spaces, apostrophes, and hyphens.", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("email must be a valid email address.", 400);
  }

  if (!PHONE_PATTERN.test(phone)) {
    throw new AppError("phone must be a valid phone number.", 400);
  }

  if (!AIRPORT_PATTERN.test(departureAirport) || !AIRPORT_PATTERN.test(arrivalAirport)) {
    throw new AppError("Airports must use 3-letter IATA codes.", 400);
  }

  if (departureAirport === arrivalAirport) {
    throw new AppError("Departure and arrival airports must be different.", 400);
  }

  const parsedDate = new Date(departureDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("departureDate must be a valid ISO date.", 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    throw new AppError("departureDate cannot be in the past.", 400);
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    departureAirport,
    arrivalAirport,
    departureDate: parsedDate.toISOString(),
  };
}

export function validateAdminLoginPayload(payload: unknown) {
  const body = ensureObject(payload, "Login payload must be an object.");

  return {
    username: assertString(body.username, "username"),
    password: assertString(body.password, "password"),
  };
}

export function validateBookingReference(reference: string) {
  const normalizedReference = normalizeBookingReference(reference);

  if (!BOOKING_REFERENCE_PATTERN.test(normalizedReference)) {
    throw new AppError("booking reference must look like FL-XXXXXX.", 400);
  }

  return normalizedReference;
}

export function validateStatusUpdatePayload(payload: unknown): UpdateBookingStatusRequest {
  const body = ensureObject(payload, "Status update payload must be an object.");

  if (typeof body.status !== "string" || !STATUS_LABELS.includes(body.status as BookingStatusLabel)) {
    throw new AppError("status must be one of Scheduled, Delayed, En Route, or Landed.", 400);
  }

  const gateValue = body.gate;
  let gate: string | null | undefined;

  if (gateValue === undefined) {
    gate = undefined;
  } else if (gateValue === null) {
    gate = null;
  } else if (typeof gateValue === "string") {
    const normalizedGate = gateValue.trim().toUpperCase();
    if (normalizedGate.length === 0) {
      gate = null;
    } else if (!GATE_PATTERN.test(normalizedGate)) {
      throw new AppError("gate must be 1-5 uppercase letters, numbers, or hyphens.", 400);
    } else {
      gate = normalizedGate;
    }
  } else {
    throw new AppError("gate must be a string or null.", 400);
  }

  const delayValue = body.delayMinutes;
  let delayMinutes: number | undefined;

  if (delayValue !== undefined) {
    if (!Number.isInteger(delayValue) || Number(delayValue) < 0 || Number(delayValue) > 1440) {
      throw new AppError("delayMinutes must be an integer between 0 and 1440.", 400);
    }

    delayMinutes = Number(delayValue);
  }

  return {
    status: body.status as BookingStatusLabel,
    gate,
    delayMinutes,
  };
}
