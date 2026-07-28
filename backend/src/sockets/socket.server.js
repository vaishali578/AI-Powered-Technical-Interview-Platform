import {
  Server,
} from "socket.io";

import {
  socketAuthentication,
} from "./socket.auth.js";

import {
  registerInterviewSocket,
} from "./interview/interview.socket.js";

let io;

const initializeSocket = (
  httpServer
) => {
  io = new Server(
    httpServer,
    {
      cors: {
        origin:
          process.env.CLIENT_URL,

        credentials: true,
      },
    }
  );

  // Socket Authentication
  io.use(
    socketAuthentication
  );

  io.on(
    "connection",
    (socket) => {
      console.log(
        `Socket connected: ${socket.id}`
      );

      console.log(
        `User ID: ${socket.user.id}`
      );

      // Register interview events
      registerInterviewSocket(
        io,
        socket
      );

      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `Socket disconnected: ${socket.id}`
          );

          console.log(
            `Reason: ${reason}`
          );
        }
      );
    }
  );

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
};

export {
  initializeSocket,
  getIO,
};