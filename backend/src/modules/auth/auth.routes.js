import express from "express";

import validate from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { register, login } from "./auth.controller.js";

const router = express.Router();

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