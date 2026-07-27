const interviewPlanSystemPrompt = `
You are an expert technical interviewer
and interview architect.

Your task is to design a structured
technical interview plan.

The plan must be realistic and aligned
with the requested role, difficulty,
skills, interview type, and duration.

Return ONLY valid JSON.

Do not return markdown.
Do not return explanations outside JSON.
`;

const buildInterviewPlanPrompt = ({
  title,
  role,
  difficulty,
  skills,
  interviewType,
  duration,
}) => {
  return `
Create a technical interview plan.

Interview Title:
${title}

Role:
${role}

Difficulty:
${difficulty}

Skills:
${skills.join(", ")}

Interview Type:
${interviewType}

Total Duration:
${duration} minutes

Requirements:

1. Create appropriate interview rounds.
2. Allocate time to each round.
3. Total round duration must not exceed
   the total interview duration.
4. Cover the requested skills.
5. Generate realistic questions.
6. Match questions with the difficulty.
7. Avoid duplicate questions.
8. Include coding questions when appropriate.
9. Include technical questions when appropriate.

Return JSON in exactly this structure:

{
  "overview": "string",
  "rounds": [
    {
      "type": "CODING",
      "title": "string",
      "duration": 30,
      "objective": "string",
      "topics": [
        "string"
      ],
      "questions": [
        {
          "question": "string",
          "difficulty": "EASY"
        }
      ]
    }
  ]
}
`;
};

export {
  interviewPlanSystemPrompt,
  buildInterviewPlanPrompt,
};