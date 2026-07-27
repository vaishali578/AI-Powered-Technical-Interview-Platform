import Joi from "joi";

const createInvitationSchema =
  Joi.object({
    interviewId: Joi.string()
      .hex()
      .length(24)
      .required(),

    candidateEmail: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required(),
  });

const invitationTokenSchema =
  Joi.object({
    token: Joi.string()
      .trim()
      .min(10)
      .required(),
  });

export {
  createInvitationSchema,
  invitationTokenSchema,
};