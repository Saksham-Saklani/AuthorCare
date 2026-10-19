import express from "express";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/book.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/tickets", ticketRoutes);

// Health-check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AuthorCare API is running",
  });
});

export default app;