import crypto from "crypto";
import Invitation from "./invitation.model.js";
import Interview from "../interviews/interview.model.js";
import AppError from "../../utils/AppError.js";

const createInvitation = async ({
  interviewId,
  recruiterId,
  candidateEmail,
}) => {
  // 1. Check interview
  const interview =
    await Interview.findOne({
      _id: interviewId,
      recruiter: recruiterId,
    });

  if (!interview) {
    throw new AppError(
      "Interview not found",
      404
    );
  }

  // 2. Normalize email
  const normalizedEmail =
    candidateEmail
      .trim()
      .toLowerCase();

  // 3. Check duplicate invitation
  const existingInvitation =
    await Invitation.findOne({
      interview: interviewId,
      candidateEmail:
        normalizedEmail,
      status: {
        $ne: "CANCELLED",
      },
    });

  if (existingInvitation) {
    throw new AppError(
      "Candidate has already been invited",
      409
    );
  }

  // 4. Generate secure token
  const rawToken =
    crypto
      .randomBytes(32)
      .toString("hex");

  // 5. Hash token
  const tokenHash =
    crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

  // 6. Token expiry
  const expiresAt =
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000
    );

  // 7. Save invitation
  const invitation =
    await Invitation.create({
      interview: interviewId,
      recruiter: recruiterId,
      candidateEmail:
        normalizedEmail,
      tokenHash,
      expiresAt,
    });

  return {
    invitation,
    rawToken,
  };
};


const verifyInvitation = async (
  rawToken
) => {
  // 1. Hash received token
  const tokenHash =
    crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

  // 2. Find invitation
  const invitation =
    await Invitation.findOne({
      tokenHash,
    })
      .populate(
        "interview",
        "title role difficulty skills interviewType duration"
      )
      .populate(
        "recruiter",
        "name email"
      );

  if (!invitation) {
    throw new AppError(
      "Invalid invitation",
      404
    );
  }

  // 3. Check status
  if (
    invitation.status ===
    "CANCELLED"
  ) {
    throw new AppError(
      "This invitation has been cancelled",
      400
    );
  }

  if (
    invitation.status ===
    "ACCEPTED"
  ) {
    throw new AppError(
      "This invitation has already been accepted",
      400
    );
  }

  // 4. Check expiry
  if (
    invitation.expiresAt <
    new Date()
  ) {
    invitation.status =
      "EXPIRED";

    await invitation.save();

    throw new AppError(
      "This invitation has expired",
      400
    );
  }

  return invitation;
};

const acceptInvitation = async ({
  rawToken,
  candidateId,
}) => {
  // 1. Hash token
  const tokenHash =
    crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

  // 2. Find invitation
  const invitation =
    await Invitation.findOne({
      tokenHash,
    });

  if (!invitation) {
    throw new AppError(
      "Invalid invitation",
      404
    );
  }

  // 3. Check status
  if (
    invitation.status !==
    "PENDING"
  ) {
    throw new AppError(
      "Invitation is no longer valid",
      400
    );
  }

  // 4. Check expiry
  if (
    invitation.expiresAt <
    new Date()
  ) {
    invitation.status =
      "EXPIRED";

    await invitation.save();

    throw new AppError(
      "Invitation has expired",
      400
    );
  }

  // 5. Link candidate
  invitation.candidate =
    candidateId;

  invitation.status =
    "ACCEPTED";

  invitation.acceptedAt =
    new Date();

  await invitation.save();

  return invitation;
};

export {
    createInvitation,
    verifyInvitation,
    acceptInvitation
}