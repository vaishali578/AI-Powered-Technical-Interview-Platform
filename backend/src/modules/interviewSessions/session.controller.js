import asyncHandler from
  "../../utils/asyncHandler.js";

import ApiResponse from
  "../../utils/ApiResponse.js";

import {
  createInterviewSession,
} from "./interviewSession.service.js";

const create =
  asyncHandler(
    async (req, res) => {
      const {
        interviewId,
      } = req.body;

      const session =
        await createInterviewSession({
          interviewId,

          candidateId:
            req.user.id,
        });

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "Interview session created successfully",
            session
          )
        );
    }
  );

export {
  create,
};