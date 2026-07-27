import express from "express";

import authenticate from
  "../../middlewares/authenticate.js";

import authorize from
  "../../middlewares/authorize.js";

import validate from
  "../../middlewares/validate.js";

import {
  create,
} from "./interviewSession.controller.js";

import {
  createSessionSchema,
} from "./interviewSession.validation.js";

const router =
  express.Router();

/**
 * @swagger
 * /api/interview-sessions:
 *   post:
 *     summary: Create an interview session
 *     description: Creates an interview session for a candidate who has accepted an invitation to the interview.
 *     tags:
 *       - Interview Sessions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interviewId
 *             properties:
 *               interviewId:
 *                 type: string
 *                 example: 665abc123456789012345678
 *     responses:
 *       201:
 *         description: Interview session created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Candidate is not authorized to create this session
 *       404:
 *         description: Interview not found
 *       409:
 *         description: Interview session already exists
 */
router.post(
  "/",
  authenticate,
  authorize("CANDIDATE"),
  validate(createSessionSchema),
  create
);

export default router;