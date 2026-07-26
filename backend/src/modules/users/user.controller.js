import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  getMyProfile,
  updateMyProfile,
  getUserById,
} from "./user.service.js";

const getMe = asyncHandler(async (req, res) => {
  const user = await getMyProfile(req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Profile fetched successfully",
        user
      )
    );
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await updateMyProfile(
    req.user.id,
    req.body
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Profile updated successfully",
        user
      )
    );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(
    req.params.id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User fetched successfully",
        user
      )
    );
});

export {
  getMe,
  updateMe,
  getUser,
};