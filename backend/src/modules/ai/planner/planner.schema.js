import Joi from "joi";

const questionSchema = Joi.object({
  question: Joi.string()
    .trim()
    .min(5)
    .required(),

  difficulty: Joi.string()
    .valid(
      "EASY",
      "MEDIUM",
      "HARD"
    )
    .required(),
});

const roundSchema = Joi.object({
  type: Joi.string()
    .valid(
      "CODING",
      "TECHNICAL",
      "BEHAVIORAL"
    )
    .required(),

  title: Joi.string()
    .trim()
    .required(),

  duration: Joi.number()
    .integer()
    .positive()
    .required(),

  objective: Joi.string()
    .trim()
    .required(),

  topics: Joi.array()
    .items(
      Joi.string().trim()
    )
    .min(1)
    .required(),

  questions: Joi.array()
    .items(questionSchema)
    .min(1)
    .required(),
});

const interviewPlanSchema =
  Joi.object({
    overview: Joi.string()
      .trim()
      .required(),

    rounds: Joi.array()
      .items(roundSchema)
      .min(1)
      .required(),
  });


  const validateInterviewPlan = (
  interviewPlan
) => {
  const {
    error,
    value,
  } = interviewPlanSchema.validate(
    interviewPlan,
    {
      abortEarly: false,
      stripUnknown: true,
    }
  );

  if (error) {
    return {
      valid: false,
      errors: error.details.map(
        (detail) => detail.message
      ),
    };
  }

  return {
    valid: true,
    data: value,
  };
};


export {
  interviewPlanSchema,
  validateInterviewPlan
};