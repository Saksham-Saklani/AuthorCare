import express from "express";

const app = express();
app.use(express.json());

// Health-check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AuthorCare API is running",
  });
});

export default app;