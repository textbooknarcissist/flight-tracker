import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import type { Booking } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    booking: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    admin: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    adminLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

vi.mock("../src/config/prisma", () => ({
  prisma: prismaMock,
}));

import app from "../src/app";
import { adminLoginLimiter } from "../src/middleware/rateLimit";

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    bookingReference: "FL-ABC123",
    firstName: "Ada",
    lastName: "Okafor",
    email: "ada@example.com",
    phone: "+2348000000000",
    departureAirport: "LOS",
    arrivalAirport: "ABV",
    departureDate: new Date("2030-05-01T10:30:00.000Z"),
    status: "SCHEDULED",
    seat: "12A",
    gate: null,
    delayMinutes: 0,
    createdAt: new Date("2030-04-01T10:30:00.000Z"),
    updatedAt: new Date("2030-04-01T10:30:00.000Z"),
    updatedByAdminAt: null,
    ...overrides,
  } as Booking;
}

describe("backend app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.FRONTEND_ORIGIN = "http://localhost:5173";
    adminLoginLimiter.resetKey("::ffff:127.0.0.1");
    adminLoginLimiter.resetKey("::1");
    prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === "function") {
        return arg(prismaMock);
      }

      return Promise.all(arg as Promise<unknown>[]);
    });
  });

  it("rejects invalid booking payloads", async () => {
    const response = await request(app).post("/api/bookings").send({
      firstName: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/firstName is required|valid first name/i);
  });

  it("creates a booking with generated defaults", async () => {
    prismaMock.booking.create.mockResolvedValue(makeBooking());
    const departureDate = "2030-05-01T10:30:00.000Z";

    const response = await request(app).post("/api/bookings").send({
      firstName: "Ada",
      lastName: "Okafor",
      email: "ada@example.com",
      phone: "+2348000000000",
      departureAirport: "LOS",
      arrivalAirport: "ABV",
      departureDate,
    });

    expect(response.status).toBe(201);
    expect(response.body.bookingReference).toMatch(/^FL-/);
    expect(response.body.status).toBe("Scheduled");
    expect(response.body.seat).toBe("12A");
    expect(response.body.departureAirport).toBe("LOS");
    expect(response.body.arrivalAirport).toBe("ABV");
    expect(response.body.departureDate).toBe(departureDate);
    expect(prismaMock.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          departureDate: new Date(departureDate),
        }),
      }),
    );
  });

  it("returns only public-safe booking fields for lookup", async () => {
    prismaMock.booking.findUnique.mockResolvedValue(makeBooking());

    const response = await request(app).get("/api/bookings/FL-ABC123");

    expect(response.status).toBe(200);
    expect(response.body.firstName).toBe("Ada");
    expect(response.body.email).toBeUndefined();
    expect(response.body.phone).toBeUndefined();
    expect(response.body.status).toBe("Scheduled");
    expect(response.body.departureAirport).toBe("LOS");
    expect(response.body.arrivalAirport).toBe("ABV");
    expect(response.body.departureDate).toBe("2030-05-01T10:30:00.000Z");
  });

  it("rejects booking creation for a past datetime", async () => {
    const response = await request(app).post("/api/bookings").send({
      firstName: "Ada",
      lastName: "Okafor",
      email: "ada@example.com",
      phone: "+2348000000000",
      departureAirport: "LOS",
      arrivalAirport: "ABV",
      departureDate: "2000-05-01T10:30:00.000Z",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/cannot be in the past/i);
  });

  it("rejects bad admin credentials", async () => {
    prismaMock.admin.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/api/admin/login").send({
      username: "admin",
      password: "wrong",
    });

    expect(response.status).toBe(401);
  });

  it("rate limits repeated admin login attempts", async () => {
    prismaMock.admin.findUnique.mockResolvedValue(null);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app).post("/api/admin/login").send({
        username: "admin",
        password: "wrong",
      });
    }

    const response = await request(app).post("/api/admin/login").send({
      username: "admin",
      password: "wrong",
    });

    expect(response.status).toBe(429);
  });

  it("rejects unauthorized admin routes", async () => {
    const response = await request(app).get("/api/admin/bookings");

    expect(response.status).toBe(401);
  });

  it("clears the auth cookie on logout", async () => {
    const token = jwt.sign({ adminId: "admin-1", username: "ops-admin" }, "test-secret");

    const response = await request(app)
      .post("/api/admin/logout")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logged out.");
    expect(response.headers["set-cookie"]?.[0]).toContain("auth_token=");
  });

  it("allows an authorized admin to update booking status and write a log", async () => {
    prismaMock.booking.update.mockResolvedValue(
      makeBooking({
        status: "DELAYED",
        gate: "B2",
        delayMinutes: 25,
        updatedByAdminAt: new Date("2030-04-01T12:00:00.000Z"),
      }),
    );
    prismaMock.adminLog.create.mockResolvedValue({
      id: "log-1",
    });

    const token = jwt.sign({ adminId: "admin-1", username: "ops-admin" }, "test-secret");

    const response = await request(app)
      .patch("/api/admin/bookings/FL-ABC123/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "Delayed",
        gate: "B2",
        delayMinutes: 25,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Delayed");
    expect(prismaMock.adminLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        bookingReference: "FL-ABC123",
      }),
    });
  });

  it("returns 404 when an admin updates a missing booking", async () => {
    prismaMock.booking.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("missing booking", {
        code: "P2025",
        clientVersion: "6.18.0",
      }),
    );

    const token = jwt.sign({ adminId: "admin-1", username: "ops-admin" }, "test-secret");

    const response = await request(app)
      .patch("/api/admin/bookings/FL-MISS1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "Delayed",
        gate: "B2",
        delayMinutes: 25,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Booking not found.");
    expect(prismaMock.adminLog.create).not.toHaveBeenCalled();
  });
});
