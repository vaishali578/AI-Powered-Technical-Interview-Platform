import jwt from "jsonwebtoken";

import User from "../modules/auth/auth.model.js";

const socketAuthentication = async (
  socket,
  next
) => {
  try {
    const token =
      socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error(
          "Authentication required"
        )
      );
    }

    const decoded =
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );

    const user =
      await User.findById(
        decoded.userId
      ).select(
        "_id name email role"
      );

    if (!user) {
      return next(
        new Error(
          "User not found"
        )
      );
    }

    // Attach authenticated user
    // to socket
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error.message
    );

    next(
      new Error(
        "Invalid or expired token"
      )
    );
  }
};

export {
  socketAuthentication,
};