import Question from
  "../questions/question.model.js";

import CodingSubmission from
  "./submission.model.js";

import InterviewSession from
  "../interviewSessions/session.model.js";

import {
  runInSandbox,
} from "./execution/sandbox.service.js";

const evaluateSubmission = async ({
  question,
  code,
  language,
}) => {
  const testResults = [];

  let passedTests = 0;

  let totalExecutionTime = 0;

  for (
    const testCase of question.testCases
  ) {
    const result =
      await runInSandbox({
        code,
        language,
        input:
          testCase.input,
      });

    const actualOutput =
      normalizeOutput(
        result.output
      );

    const expectedOutput =
      normalizeOutput(
        testCase.expectedOutput
      );

    const passed =
      result.status ===
        "SUCCESS" &&
      actualOutput ===
        expectedOutput;

    if (passed) {
      passedTests++;
    }

    totalExecutionTime +=
      result.executionTime || 0;

    testResults.push({
      passed,

      actualOutput,

      expectedOutput,

      executionTime:
        result.executionTime || 0,

      status:
        result.status,
    });

    // Stop if code timed out
    if (
      result.status ===
      "TIMEOUT"
    ) {
      break;
    }
  }

  return {
    testResults,

    passedTests,

    totalTests:
      question.testCases.length,

    totalExecutionTime,
  };
};

const normalizeOutput = (
  output = ""
) => {
  return output
    .trim()
    .replace(/\r\n/g, "\n");
};

const submitCode = async ({
  sessionId,
  candidateId,
  questionId,
  code,
  language,
}) => {
  // 1. Find interview session
  const session =
    await InterviewSession.findById(
      sessionId
    );

  if (!session) {
    throw new Error(
      "Interview session not found"
    );
  }

  // 2. Check candidate
  if (
    session.candidate.toString() !==
    candidateId.toString()
  ) {
    throw new Error(
      "You are not authorized to submit code"
    );
  }

  // 3. Check interview status
  if (
    session.status !==
    "IN_PROGRESS"
  ) {
    throw new Error(
      "Interview is not in progress"
    );
  }

  // 4. Find question
  const question =
    await Question.findById(
      questionId
    );

  if (!question) {
    throw new Error(
      "Question not found"
    );
  }

  // 5. Check language
  if (
    !question.supportedLanguages.includes(
      language
    )
  ) {
    throw new Error(
      "Language is not supported for this question"
    );
  }

  // 6. Create submission
  const submission =
    await CodingSubmission.create({
      sessionId,

      candidateId,

      questionId,

      language,

      code,

      status:
        "RUNNING",

      totalTests:
        question.testCases.length,
    });

  try {
    const testResults = [];

    let passedTests = 0;

    let totalExecutionTime = 0;

    // 7. Run all test cases
    for (
      const testCase of
      question.testCases
    ) {
      const result =
        await runInSandbox({
          code,

          language,

          input:
            testCase.input,
        });

      const actualOutput =
        normalizeOutput(
          result.output
        );

      const expectedOutput =
        normalizeOutput(
          testCase.expectedOutput
        );

      const passed =
        result.status ===
          "SUCCESS" &&
        actualOutput ===
          expectedOutput;

      if (passed) {
        passedTests++;
      }

      totalExecutionTime +=
        result.executionTime || 0;

      testResults.push({
        passed,

        actualOutput,

        expectedOutput,

        executionTime:
          result.executionTime,
      });

      // Stop on timeout
      if (
        result.status ===
        "TIMEOUT"
      ) {
        break;
      }
    }

    // 8. Calculate final status
    const allTestsPassed =
      passedTests ===
        question.testCases.length;

    const finalStatus =
      allTestsPassed
        ? "PASSED"
        : "FAILED";

    // 9. Update submission
    submission.status =
      finalStatus;

    submission.testResults =
      testResults;

    submission.passedTests =
      passedTests;

    submission.totalTests =
      question.testCases.length;

    submission.executionTime =
      totalExecutionTime;

    await submission.save();

    // 10. Return result
    return {
      submissionId:
        submission._id,

      status:
        finalStatus,

      totalTests:
        question.testCases.length,

      passedTests,

      failedTests:
        question.testCases.length -
        passedTests,

      testResults,

      executionTime:
        totalExecutionTime,
    };
  } catch (error) {
    // Mark submission as error
    submission.status =
      "ERROR";

    await submission.save();

    throw error;
  }
};

export {
  submitCode,
};