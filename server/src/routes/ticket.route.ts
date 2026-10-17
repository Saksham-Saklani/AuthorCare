import { Router } from "express";
import {
  createTicketHandler,
  getAuthorTicketsHandler,
  getAuthorTicketByIdHandler,
  getAllTicketsHandler,
} from "../controllers/ticket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTicketSchema, adminTicketQuerySchema } from "../validations/ticket.validation.js";
import { createMessageSchema } from "../validations/message.validation.js";
import { createAuthorMessageHandler } from "../controllers/message.controller.js";
import { authorize } from "../middlewares/authorise.middleware.js";
import { validateQuery } from "../middlewares/validateQuery.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createTicketSchema),
  createTicketHandler,
);
router.get("/", authenticate, getAuthorTicketsHandler);

router.get("/admin/",
  authenticate,
  authorize,
  validateQuery(adminTicketQuerySchema),
  getAllTicketsHandler
)

router.get("/:id", authenticate, getAuthorTicketByIdHandler);

router.post("/:id/messages",
    authenticate,
    validate(createMessageSchema),
    createAuthorMessageHandler
)



export default router;
