import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5002");

const socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: false,
  // auth is a callback so it always reads the freshest token on connect/reconnect
  auth: (cb) => {
    cb({ token: localStorage.getItem("token") ?? "" });
  },
});

export default socket;
