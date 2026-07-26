import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";
import AppError from "../utils/AppError.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return next(
      new AppError(
        "Authentication required",
        401
      )
    );
  }

  const accessToken =
    authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET
    );

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return next(
        new AppError(
          "User no longer exists",
          401
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          "User account is inactive",
          403
        )
      );
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return next(
      new AppError(
        "Invalid or expired access token",
        401
      )
    );
  }
};

export default authenticate;