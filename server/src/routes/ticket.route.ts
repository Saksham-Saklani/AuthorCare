import { Router } from "express";
import {
  createTicketHandler,
  getAuthorTicketsHandler,
  getAuthorTicketByIdHandler,
  getAllTicketsHandler,
  updateTicketHandler,
  assignTicketHandler,
  generateTicketReplyHandler,
  getAdminTicketByIdHandler
} from "../controllers/ticket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTicketSchema, adminTicketQuerySchema, updateTicketSchema } from "../validations/ticket.validation.js";
import { adminMessageSchema, createMessageSchema } from "../validations/message.validation.js";
import { createAuthorMessageHandler, sendAdminMessageHandler } from "../controllers/message.controller.js";
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

router.get("/admin/all",
  authenticate,
  authorize,
  validateQuery(adminTicketQuerySchema),
  getAllTicketsHandler
)

router.patch("/admin/:id",
    authenticate,
    authorize,
    validate(updateTicketSchema),
    updateTicketHandler
)

router.get("/:id", authenticate, getAuthorTicketByIdHandler);
router.get("/admin/:id", authenticate, authorize, getAdminTicketByIdHandler);

router.post("/:id/messages",
    authenticate,
    validate(createMessageSchema),
    createAuthorMessageHandler
)

router.patch("/admin/:id/assign",
  authenticate,
  authorize,
  assignTicketHandler
)

router.post("/admin/:id/ai-draft",
    authenticate,
    authorize,
    generateTicketReplyHandler
)

router.post("/admin/:id/messages",
    authenticate,
    authorize,
    validate(adminMessageSchema),
    sendAdminMessageHandler
)





export default router;
