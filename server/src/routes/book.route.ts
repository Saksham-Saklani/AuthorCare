import { Router } from "express";
import { getBooks } from "../controllers/book.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getBookByIdHandler } from "../controllers/book.controller.js";

const router = Router();

router.get("/", authenticate, getBooks);

router.get("/:id", authenticate, getBookByIdHandler);

export default router;