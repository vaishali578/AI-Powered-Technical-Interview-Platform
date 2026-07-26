import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    // Recruiter who created the interview
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    role: {
      type: String,
      required: true,
      trim: true,
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
        trim: true,
      },
    ],

    interviewType: {
      type: String,
      enum: [
        "TECHNICAL",
        "CODING",
        "FULL_INTERVIEW",
      ],
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 180,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "ACTIVE",
        "COMPLETED",
        "ARCHIVED",
      ],
      default: "DRAFT",
    },

    interviewPlan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

export default Interview;