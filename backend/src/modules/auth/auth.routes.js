import express from "express";

import validate from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from "./auth.validation.js";
import { register, login, refresh, logout } from "./auth.controller.js";
import authenticate from "../../middleware/auth.middleware.js";

const router = express.Router();


router.get(
  "/me",
  authenticate,
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Authenticated user",
      data: req.user,
    });
  }
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new candidate or recruiter account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vaishali
 *               email:
 *                 type: string
 *                 format: email
 *                 example: vaishali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum:
 *                   - RECRUITER
 *                   - CANDIDATE
 *                 example: CANDIDATE
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post(
    "/register",
    validate(registerSchema),
    register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: vaishali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account inactive
 */
router.post(
  "/login",
  validate(loginSchema),
  login
);


/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  refresh
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid request
 */

router.post(
  "/logout",
  validate(logoutSchema),
  logout
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user details
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  authenticate,
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Authenticated user",
      data: req.user,
    });
  }
);

export default router;

// POST /api/auth/register
//         │
//         ▼
// auth.routes
//         │
//         ▼
// validate(registerSchema)
//         │
//         ▼
// register controller
//         │
//         ▼
// registerUser service
//         │
//         ├── Check email
//         ├── bcrypt hash
//         └── Create User
//                 │
//                 ▼
//             MongoDB
//                 │
//                 ▼
//         Safe User Response