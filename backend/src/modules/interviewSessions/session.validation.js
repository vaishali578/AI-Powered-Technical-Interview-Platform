import Joi from "joi";

const createSessionSchema =
  Joi.object({
    interviewId: Joi.string()
      .hex()
      .length(24)
      .required(),
  });

export {
  createSessionSchema,
};