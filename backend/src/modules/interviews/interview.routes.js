import express from "express";

import authenticate from "../../middleware/auth.middleware.js";

import authorize from "../../middleware/role.middleware.js";

import validate from "../../middleware/validate.middleware.js";

import {
  create,getAll, getById
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

/**
 * @swagger
 * /api/interviews:
 *   get:
 *     summary: Get recruiter interviews
 *     tags:
 *       - Interviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interviews fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Recruiter access required
 */
router.get(
  "/",
  authenticate,
  authorize("RECRUITER"),
  getAll
);

/**
 * @swagger
 * /api/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags:
 *       - Interviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Recruiter access required
 *       404:
 *         description: Interview not found
 */
router.get(
  "/:id",
  authenticate,
  authorize("RECRUITER"),
  getById
);

export default router;