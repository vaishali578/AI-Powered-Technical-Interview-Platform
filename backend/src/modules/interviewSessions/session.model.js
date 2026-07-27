import mongoose from "mongoose";

const interviewSessionSchema =
  new mongoose.Schema(
    {
      interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
        index: true,
      },

      candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "WAITING",
          "READY",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ],
        default: "WAITING",
      },

      currentRound: {
        type: String,
        enum: [
          "CODING",
          "TECHNICAL",
          "BEHAVIORAL",
          "COMPLETED",
        ],
        default: "CODING",
      },

      startedAt: {
        type: Date,
        default: null,
      },

      endedAt: {
        type: Date,
        default: null,
      },

      lastActivityAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

interviewSessionSchema.index(
  {
    interview: 1,
    candidate: 1,
  },
  {
    unique: true,
  }
);

const InterviewSession =
  mongoose.model(
    "InterviewSession",
    interviewSessionSchema
  );

export default InterviewSession;