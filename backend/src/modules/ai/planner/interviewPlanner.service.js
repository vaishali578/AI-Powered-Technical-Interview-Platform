import {
  generateAIResponse,
} from "../ai.service.js";

import {
  interviewPlanSystemPrompt,
  buildInterviewPlanPrompt,
} from "../prompts/interview-plan.prompt.js";

import {
  validateInterviewPlan,
} from "./interview-plan.schema.js";

const MAX_RETRIES = 3;

const generateInterviewPlan = async (
  interviewData
) => {
  let previousError = null;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    const basePrompt =
      buildInterviewPlanPrompt(
        interviewData
      );

    const retryInstruction =
      previousError
        ? `

Your previous response failed validation.

Validation errors:
${previousError.join("\n")}

Please fix these errors and return
ONLY valid JSON matching the required structure.
`
        : "";

    try {
      const aiResponse =
        await generateAIResponse({
          systemPrompt:
            interviewPlanSystemPrompt,

          userPrompt:
            basePrompt +
            retryInstruction,
        });

      const validation =
        validateInterviewPlan(
          aiResponse
        );

      if (validation.valid) {
        return validation.data;
      }

      previousError =
        validation.errors;

    } catch (error) {
      console.error(
        `Attempt ${attempt} failed:`,
        error.message
      );

      if (
        attempt === MAX_RETRIES
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to generate a valid interview plan"
  );
};

export {
  generateInterviewPlan,
};