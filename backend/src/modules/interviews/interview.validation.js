import Joi from "joi";

export const createInterviewSchema =
  Joi.object({
    title: Joi.string()
      .min(3)
      .max(150)
      .required(),

    role: Joi.string()
      .min(2)
      .max(100)
      .required(),

    difficulty: Joi.string()
      .valid(
        "EASY",
        "MEDIUM",
        "HARD"
      )
      .required(),

    skills: Joi.array()
      .items(
        Joi.string().min(1)
      )
      .min(1)
      .required(),

    interviewType: Joi.string()
      .valid(
        "TECHNICAL",
        "CODING",
        "FULL_INTERVIEW"
      )
      .required(),

    duration: Joi.number()
      .integer()
      .min(15)
      .max(180)
      .required(),
  });

  export const updateInterviewSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(150),

  role: Joi.string()
    .min(2)
    .max(100),

  difficulty: Joi.string()
    .valid(
      "EASY",
      "MEDIUM",
      "HARD"
    ),

  skills: Joi.array()
    .items(
      Joi.string().min(1)
    )
    .min(1),

  interviewType: Joi.string()
    .valid(
      "TECHNICAL",
      "CODING",
      "FULL_INTERVIEW"
    ),

  duration: Joi.number()
    .integer()
    .min(15)
    .max(180),

  status: Joi.string()
    .valid(
      "DRAFT",
      "ACTIVE",
      "COMPLETED",
      "ARCHIVED"
    ),
})
  .min(1);