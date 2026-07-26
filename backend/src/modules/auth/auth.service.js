import bcrypt from "bcryptjs";
import crypto from "crypto"
import User from "./auth.model.js";
import AppError from "../../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { redisClient } from "../../config/redis.js";

const createSession = async (user) => {
  const sessionId = crypto.randomUUID();

  const refreshToken = generateRefreshToken(
    user,
    sessionId
  );

  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    12
  );

  const sessionKey = `auth:session:${sessionId}`;

  await redisClient.set(
    sessionKey,
    JSON.stringify({
      userId: user._id.toString(),
      refreshTokenHash,
    }),
    {
      EX: 7 * 24 * 60 * 60,
    }
  );

  return {
    refreshToken,
    sessionId,
  };
};

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Your account is inactive",
      403
    );
  }

  const accessToken = generateAccessToken(user);

  const {
    refreshToken,
    sessionId,
  } = await createSession(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
    sessionId,
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      401
    );
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError(
      "Invalid or expired refresh token",
      401
    );
  }

  const sessionKey =
    `auth:session:${decoded.sessionId}`;

  const session = await redisClient.get(sessionKey);

  if (!session) {
    throw new AppError(
      "Session expired or revoked",
      401
    );
  }

  const sessionData = JSON.parse(session);

  if (
    sessionData.userId !== decoded.userId
  ) {
    throw new AppError(
      "Invalid session",
      401
    );
  }

  const isValidRefreshToken =
    await bcrypt.compare(
      refreshToken,
      sessionData.refreshTokenHash
    );

  if (!isValidRefreshToken) {
    // Possible refresh token reuse
    await redisClient.del(sessionKey);

    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  const user = await User.findById(
    decoded.userId
  );

  if (!user || !user.isActive) {
    throw new AppError(
      "User not found or inactive",
      401
    );
  }

  // Generate new tokens
  const newAccessToken =
    generateAccessToken(user);

  const newRefreshToken =
    generateRefreshToken(
      user,
      decoded.sessionId
    );

  const newRefreshTokenHash =
    await bcrypt.hash(
      newRefreshToken,
      12
    );

  // Rotate refresh token
  await redisClient.set(
    sessionKey,
    JSON.stringify({
      userId: user._id.toString(),
      refreshTokenHash:
        newRefreshTokenHash,
    }),
    {
      EX: 7 * 24 * 60 * 60,
    }
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    await redisClient.del(
      `auth:session:${decoded.sessionId}`
    );
  } catch (error) {
    // Logout should be idempotent.
    // Even if token is already invalid/expired,
    // we don't need to expose the internal error.
  }
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};