import asyncHandler from
  "../../utils/asyncHandler.js";

import ApiResponse from
  "../../utils/ApiResponse.js";

import {
  createInvitation,
  verifyInvitation,
  acceptInvitation,
} from "./invitation.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

const create = asyncHandler(
  async (req, res) => {
    const {
      interviewId,
      candidateEmail,
    } = req.body;

    const result =
      await createInvitation({
        interviewId,
        recruiterId:
          req.user.id,
        candidateEmail,
      });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Invitation created successfully",
          {
            invitation:
              result.invitation,

            // Temporary for development
            inviteToken:
              result.rawToken,
          }
        )
      );
  }
);

const verify = asyncHandler(
  async (req, res) => {
    const {
      token,
    } = req.params;

    const invitation =
      await verifyInvitation(
        token
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Invitation is valid",
          invitation
        )
      );
  }
);

const accept = asyncHandler(
  async (req, res) => {
    const {
      token,
    } = req.params;

    const invitation =
      await acceptInvitation({
        rawToken: token,

        candidateId:
          req.user.id,
      });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Invitation accepted successfully",
          invitation
        )
      );
  }
);

export {
  create,
  verify,
  accept,
};