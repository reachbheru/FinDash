import { Router } from "express";
import { validateInput } from "../middlewares/inputValidator.js";
import { adminRegisterDto, adminLoginDto } from "./dto/admin-auth.dto.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  adminRegister,
  adminLogin,
  getAdminDashboard,
} from "./admin.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/admin/register:
 *   post:
 *     summary: Register admin account
 *     description: Create a new admin account (requires ADMIN_SECRET_KEY in .env)
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, confirmPassword, adminSecret]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Admin
 *               lastName:
 *                 type: string
 *                 example: User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@findash.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: AdminPassword123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: AdminPassword123
 *               adminSecret:
 *                 type: string
 *                 description: Secret key to authenticate admin registration
 *                 example: your_admin_secret_key
 *     responses:
 *       201:
 *         description: Admin account created successfully
 *       400:
 *         description: Invalid admin secret or validation error
 */
router
  .route("/register")
  .post(validateInput(adminRegisterDto), asyncHandler(adminRegister));

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Login as admin
 *     description: Authenticate admin and return access and refresh tokens
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@findash.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: AdminPassword123
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials or user not admin
 */
router
  .route("/login")
  .post(validateInput(adminLoginDto), asyncHandler(adminLogin));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     description: Get admin dashboard with system-wide statistics and user management (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     inactiveUsers:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route("/dashboard")
  .get(
    authMiddleware,
    roleMiddleware("admin"),
    asyncHandler(getAdminDashboard),
  );

export default router;
