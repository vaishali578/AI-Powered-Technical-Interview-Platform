import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  registerUser,
  loginUser,
} from "./auth.service.js";

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "User registered successfully",
        user
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Login successful",
        result
      )
    );
});

export {
  register,
  login,
};