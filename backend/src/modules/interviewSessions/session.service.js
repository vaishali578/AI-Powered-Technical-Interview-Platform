import Interview from "../interviews/interview.model.js";

import Invitation from "../invitation/invitation.model.js";

import InterviewSession from
  "./interviewSession.model.js";

import AppError from
  "../../utils/AppError.js";

const createInterviewSession =
  async ({
    interviewId,
    candidateId,
  }) => {
    // 1. Find accepted invitation
    const invitation =
      await Invitation.findOne({
        interview: interviewId,
        candidate: candidateId,
        status: "ACCEPTED",
      });

    if (!invitation) {
      throw new AppError(
        "You are not invited to this interview",
        403
      );
    }

    // 2. Check interview
    const interview =
      await Interview.findById(
        interviewId
      );

    if (!interview) {
      throw new AppError(
        "Interview not found",
        404
      );
    }

    // 3. Check existing session
    const existingSession =
      await InterviewSession.findOne({
        interview: interviewId,
        candidate: candidateId,
      });

    if (existingSession) {
      return existingSession;
    }

    // 4. Create session
    const session =
      await InterviewSession.create({
        interview: interviewId,

        candidate:
          candidateId,

        recruiter:
          interview.recruiter,

        status: "WAITING",

        currentRound:
          "CODING",

        lastActivityAt:
          new Date(),
      });

    return session;
  };

  export {
  createInterviewSession,
};