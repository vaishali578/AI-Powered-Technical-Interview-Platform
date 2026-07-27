import express from "express";

import authenticate from
  "../../middlewares/authenticate.js";

import authorize from
  "../../middlewares/authorize.js";

import validate from
  "../../middlewares/validate.js";

import {
  create,
  verify,
  accept,
} from "./invitation.controller.js";

import {
  createInvitationSchema,
} from "./invitation.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Interview invitation management
 */


/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Create an interview invitation
 *     description: Allows a recruiter to create and send an invitation to a candidate.
 *     tags:
 *       - Invitations
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
 *               - candidateEmail
 *             properties:
 *               interviewId:
 *                 type: string
 *                 example: 665a1b2c3d4e5f6789012345
 *               candidateEmail:
 *                 type: string
 *                 format: email
 *                 example: candidate@example.com
 *               expiresIn:
 *                 type: number
 *                 example: 7
 *                 description: Number of days before the invitation expires.
 *     responses:
 *       201:
 *         description: Interview invitation created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only recruiters can create invitations
 *       404:
 *         description: Interview not found
 */
router.post(
  "/",
  authenticate,
  authorize("RECRUITER"),
  validate(createInvitationSchema),
  create
);


/**
 * @swagger
 * /api/invitations/{token}:
 *   get:
 *     summary: Verify an interview invitation
 *     description: Verifies whether an interview invitation token is valid and returns invitation details.
 *     tags:
 *       - Invitations
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique invitation token
 *         example: 8f7a9b2c1d3e4f5g6h7i8j9k
 *     responses:
 *       200:
 *         description: Invitation is valid
 *       400:
 *         description: Invalid or expired invitation
 *       404:
 *         description: Invitation not found
 */
router.get(
  "/:token",
  verify
);


/**
 * @swagger
 * /api/invitations/{token}/accept:
 *   post:
 *     summary: Accept an interview invitation
 *     description: Allows an authenticated candidate to accept a valid interview invitation.
 *     tags:
 *       - Invitations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique invitation token
 *         example: 8f7a9b2c1d3e4f5g6h7i8j9k
 *     responses:
 *       200:
 *         description: Interview invitation accepted successfully
 *       400:
 *         description: Invalid, expired, or already accepted invitation
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only candidates can accept invitations
 *       404:
 *         description: Invitation not found
 */
router.post(
  "/:token/accept",
  authenticate,
  authorize("CANDIDATE"),
  accept
);

export default router;