import express from "express";

import authenticate
  from "../../middleware/auth.middleware.js";

import authorize
  from "../../middleware/role.middleware.js";

import validate
  from "../../middleware/validate.middleware.js";

import {
  create,
} from "./interview.controller.js";

import {
  createInterviewSchema,
} from "./interview.validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/interviews:
 *   post:
 *     summary: Create a new interview
 *     tags:
 *       - Interviews
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - role
 *               - difficulty
 *               - skills
 *               - interviewType
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: MERN Stack Developer Interview
 *               role:
 *                 type: string
 *                 example: MERN Stack Developer
 *               difficulty:
 *                 type: string
 *                 enum:
 *                   - EASY
 *                   - MEDIUM
 *                   - HARD
 *                 example: MEDIUM
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - React
 *                   - Node.js
 *                   - MongoDB
 *               interviewType:
 *                 type: string
 *                 enum:
 *                   - TECHNICAL
 *                   - CODING
 *                   - FULL_INTERVIEW
 *                 example: FULL_INTERVIEW
 *               duration:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       201:
 *         description: Interview created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Recruiter access required
 */
router.post(
  "/",
  authenticate,
  authorize("RECRUITER"),
  validate(createInterviewSchema),
  create
);

export default router;