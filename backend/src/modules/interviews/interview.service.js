import Interview from "./interview.model.js";
import AppError from "../../utils/AppError.js";

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

export {
  createInterview,
};