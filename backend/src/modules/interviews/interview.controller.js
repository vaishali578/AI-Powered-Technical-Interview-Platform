import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createInterview, getRecruiterInterviews, getInterviewById
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

const getAll = asyncHandler(
  async (req, res) => {
    const interviews =
      await getRecruiterInterviews(
        req.user.id
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Interviews fetched successfully",
          interviews
        )
      );
  }
);

const getById = asyncHandler(
  async (req, res) => {
    const interview =
      await getInterviewById(
        req.params.id,
        req.user.id
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Interview fetched successfully",
          interview
        )
      );
  }
);

export {
  create,
  getAll,
  getById
};