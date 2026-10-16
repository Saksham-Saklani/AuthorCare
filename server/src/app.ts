import express from "express";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/book.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Health-check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AuthorCare API is running",
  });
});

export default app;