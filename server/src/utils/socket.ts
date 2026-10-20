import { io } from "../lib/socket.js";

export const emitTicketUpdated = async (ticketId: string) => {
  const room = `ticket:${ticketId}`;

  const sockets = await io.in(room).fetchSockets();

  io.to(room).emit("ticket:updated", { ticketId });
};