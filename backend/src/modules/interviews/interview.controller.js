import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createInterview,
} from "./interview.service.js";

const create = asyncHandler(
  async (req, res) => {
    const interview =
      await createInterview(
        req.user.id,
        req.body
      );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Interview created successfully",
          interview
        )
      );
  }
);

export {
  create,
};