import mongoose from "mongoose";

const testResultSchema =
  new mongoose.Schema(
    {
      testCaseId: {
        type: String,
      },

      passed: {
        type: Boolean,

        required: true,
      },

      actualOutput: {
        type: String,
      },

      expectedOutput: {
        type: String,
      },

      executionTime: {
        type: Number,
      },
    },

    {
      _id: false,
    }
  );

const codingSubmissionSchema =
  new mongoose.Schema(
    {
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "InterviewSession",

        required: true,
      },

      candidateId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      questionId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Question",

        required: true,
      },

      language: {
        type: String,

        required: true,
      },

      code: {
        type: String,

        required: true,
      },

      status: {
        type: String,

        enum: [
          "PENDING",
          "RUNNING",
          "PASSED",
          "FAILED",
          "ERROR",
          "TIMEOUT",
        ],

        default: "PENDING",
      },

      testResults: [
        testResultSchema,
      ],

      totalTests: {
        type: Number,

        default: 0,
      },

      passedTests: {
        type: Number,

        default: 0,
      },

      executionTime: {
        type: Number,

        default: 0,
      },
    },

    {
      timestamps: true,
    }
  );

const CodingSubmission =
  mongoose.model(
    "CodingSubmission",
    codingSubmissionSchema
  );

export default CodingSubmission;