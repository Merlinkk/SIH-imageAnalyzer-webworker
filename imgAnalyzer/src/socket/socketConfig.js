import { Server as SocketIOServer } from "socket.io";

export const initializeSocketIO = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  return io;
};
