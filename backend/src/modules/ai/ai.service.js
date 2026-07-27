import OpenAI from "openai";
import AppError from "../../utils/AppError.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIResponse = async ({
  systemPrompt,
  userPrompt,
}) => {
  try {
    const response =
      await openai.chat.completions.create({
        model:
          process.env.OPENAI_MODEL ||
          "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],

        response_format: {
          type: "json_object",
        },
      });

    const content =
      response.choices?.[0]?.message?.content;

    if (!content) {
      throw new AppError(
        "Empty response received from AI",
        502
      );
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new AppError(
        "AI returned invalid JSON",
        502
      );
    }
  } catch (error) {
    console.error(
      "AI Service Error:",
      error
    );

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "AI service is currently unavailable",
      502
    );
  }
};

export {
  generateAIResponse,
};