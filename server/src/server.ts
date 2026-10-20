import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { initializeSocket } from "./lib/socket.js";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`AuthorCare API running on port ${PORT}`);
});