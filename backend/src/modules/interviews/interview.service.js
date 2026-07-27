import Interview from "./interview.model.js";
import AppError from "../../utils/AppError.js";
import generateInterviewPlan from "../ai/planner/interviewPlanner.service.js"

const createInterview = async (
  recruiterId,
  interviewData
) => {
  const interview = await Interview.create({
    recruiter: recruiterId,
    ...interviewData,
  });

  return interview;
};

const getRecruiterInterviews = async (recruiterId) => {
  const interviews = await Interview.find({
    recruiter: recruiterId,
  })
    .sort({ createdAt: -1 })
    .select(
      "title role difficulty skills interviewType duration status createdAt"
    );

  return interviews;
};

const getInterviewById = async (
  interviewId,
  recruiterId
) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    recruiter: recruiterId,
  });

  if (!interview) {
    throw new AppError(
      "Interview not found",
      404
    );
  }

  return interview;
};

const updateInterview = async (
  interviewId,
  recruiterId,
  updateData
) => {
  const interview =
    await Interview.findOneAndUpdate(
      {
        _id: interviewId,
        recruiter: recruiterId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!interview) {
    throw new AppError(
      "Interview not found",
      404
    );
  }

  return interview;
};

const deleteInterview = async (
  interviewId,
  recruiterId
) => {
  const interview =
    await Interview.findOneAndDelete({
      _id: interviewId,
      recruiter: recruiterId,
    });

  if (!interview) {
    throw new AppError(
      "Interview not found",
      404
    );
  }

  return interview;
};

const generatePlanForInterview = async (
  interviewId,
  recruiterId
) => {
  const interview =
    await Interview.findOne({
      _id: interviewId,
      recruiter: recruiterId,
    });

  if (!interview) {
    throw new AppError(
      "Interview not found",
      404
    );
  }

  const interviewPlan =
    await generateInterviewPlan({
      title: interview.title,
      role: interview.role,
      difficulty: interview.difficulty,
      skills: interview.skills,
      interviewType:
        interview.interviewType,
      duration: interview.duration,
    });

  interview.interviewPlan =
    interviewPlan;

  await interview.save();

  return interview;
};

export {
  createInterview,
  getRecruiterInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  generatePlanForInterview
};