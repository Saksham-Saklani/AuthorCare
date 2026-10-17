import { Router } from "express";
import {
  createTicketHandler,
  getAuthorTicketsHandler,
  getAuthorTicketByIdHandler,
} from "../controllers/ticket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTicketSchema } from "../validations/ticket.validation.js";
import { createMessageSchema } from "../validations/message.validation.js";
import { createAuthorMessageHandler } from "../controllers/message.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createTicketSchema),
  createTicketHandler,
);
router.get("/", authenticate, getAuthorTicketsHandler);
router.get("/:id", authenticate, getAuthorTicketByIdHandler);

router.post("/:id/messages",
    authenticate,
    validate(createMessageSchema),
    createAuthorMessageHandler
)

export default router;
