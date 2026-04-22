import { Router } from "express";

import { createBookingHandler, getBookingHandler } from "../controllers/bookings.controller";

const bookingsRouter = Router();

bookingsRouter.post("/", createBookingHandler);
bookingsRouter.get("/:ref", getBookingHandler);

export default bookingsRouter;
