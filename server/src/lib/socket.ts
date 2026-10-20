import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import "dotenv/config";
import prisma from "../lib/prisma.js";

export let io: Server;

export const initializeSocket = (server: import("node:http").Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      // 1. Handshake auth object (primary — sent by client via socket auth option)
      // 2. Authorization header
      // 3. Cookie fallback (same-site / local dev)
      const authHeader = socket.handshake.headers.authorization;
      const token: string | undefined =
        socket.handshake.auth?.token ||
        (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined) ||
        socket.handshake.headers.cookie
          ?.split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("token="))
          ?.slice("token=".length);

      if (!token || !process.env.JWT_SECRET) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        decodeURIComponent(token),
        process.env.JWT_SECRET,
      );

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "string" ||
        (decoded.role !== "AUTHOR" && decoded.role !== "ADMIN")
      ) {
        return next(new Error("Invalid authentication token"));
      }

      socket.data.user = {
        id: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as {
      id: string;
      role: "AUTHOR" | "ADMIN";
    };

    if (user.role === "ADMIN") {
      socket.join("admins");
    }
    socket.on("ticket:subscribe", async (ticketId: string) => {
      if (typeof ticketId !== "string") return;

      try {
        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId },
          select: { id: true, authorId: true },
        });

        if (!ticket) {
          console.warn(
            `[Socket] ticket:subscribe failed: ticket ${ticketId} not found`,
          );
          return;
        }

        const user = socket.data.user as {
          id: string;
          role: "AUTHOR" | "ADMIN";
        };

        if (user.role === "AUTHOR" && ticket.authorId !== user.id) {
          console.warn(
            `[Socket] Forbidden ticket subscription for author ${user.id} on ticket ${ticketId}`,
          );
          return;
        }

        socket.join(`ticket:${ticket.id}`);
      } catch (error) {
        console.error("Failed to authorize ticket subscription:", error);
      }
    });

    socket.on("ticket:unsubscribe", (ticketId: string) => {
      if (typeof ticketId !== "string") return;
      socket.leave(`ticket:${ticketId}`);
    });
  });
  

  return io;
};

