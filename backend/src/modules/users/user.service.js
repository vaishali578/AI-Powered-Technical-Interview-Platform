import User from "../auth/auth.model.js";
import AppError from "../../utils/AppError.js";

const getMyProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

const updateMyProfile = async (
  userId,
  { name }
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export {
  getMyProfile,
  updateMyProfile,
  getUserById,
};