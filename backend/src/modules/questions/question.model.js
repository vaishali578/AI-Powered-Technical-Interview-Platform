import mongoose from "mongoose";

const testCaseSchema =
  new mongoose.Schema(
    {
      input: {
        type: String,
        required: true,
      },

      expectedOutput: {
        type: String,
        required: true,
      },

      isHidden: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );

const questionSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        required: true,
      },

      difficulty: {
        type: String,

        enum: [
          "EASY",
          "MEDIUM",
          "HARD",
        ],

        required: true,
      },

      skills: [
        {
          type: String,
        },
      ],

      supportedLanguages: [
        {
          type: String,
        },
      ],

      testCases: [
        testCaseSchema,
      ],

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      isActive: {
        type: Boolean,

        default: true,
      },
    },

    {
      timestamps: true,
    }
  );

const Question =
  mongoose.model(
    "Question",
    questionSchema
  );

export default Question;