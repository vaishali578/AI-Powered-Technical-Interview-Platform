import mongoose from "mongoose";

const invitationSchema =
  new mongoose.Schema(
    {
      interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
        index: true,
      },

      recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      candidateEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      tokenHash: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "ACCEPTED",
          "EXPIRED",
          "CANCELLED",
        ],
        default: "PENDING",
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

invitationSchema.index(
  {
    interview: 1,
    candidateEmail: 1,
  },
  {
    unique: true,
  }
);

const Invitation =
  mongoose.model(
    "Invitation",
    invitationSchema
  );

export default Invitation;