import { Router } from "express";
import {
  createTicketHandler,
  getAuthorTicketsHandler,
  getAuthorTicketByIdHandler,
} from "../controllers/ticket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTicketSchema } from "../validations/ticket.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createTicketSchema),
  createTicketHandler,
);
router.get("/", authenticate, getAuthorTicketsHandler);
router.get("/:id", authenticate, getAuthorTicketByIdHandler);

export default router;
