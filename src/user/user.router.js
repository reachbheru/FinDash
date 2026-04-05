import { validateInput } from "../middlewares/inputValidator.js";
import {
  createUserDto,
  updateUserDto,
  updateUserStrictDto,
  updateUserProfileDto,
  updateUserAdminDto,
  deleteUserDto,
  deleteUserWithPasswordDto,
  softDeleteUserDto,
  bulkDeleteUserDto,
  loginUserDto,
  refreshTokenDto,
} from "./dto/index.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  createUser,
  getAllUsers,
  getUserProfile,
  getUserById,
  updateUser,
  updateUserProfile,
  updateOwnProfile,
  updateUserRoleAndStatus,
  deleteUser,
  deleteUserWithPassword,
  softDeleteUser,
  restoreUser,
  bulkDeleteUsers,
  getUserStatistics,
  searchUsers,
  loginUser,
  refreshToken,
} from "./user.controller.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user account
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, confirmPassword]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
router.route("/").post(validateInput(createUserDto), asyncHandler(createUser));

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return access and refresh tokens
 *     tags:
 *       - Users
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
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
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
 *         description: Invalid credentials
 */
router
  .route("/login")
  .post(validateInput(loginUserDto), asyncHandler(loginUser));

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGc...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router
  .route("/refresh-token")
  .post(validateInput(refreshTokenDto), asyncHandler(refreshToken));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users with pagination and filtering (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [viewer, analyst, admin]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route("/")
  .get(authMiddleware, roleMiddleware("admin"), asyncHandler(getAllUsers));

/**
 * @swagger
 * /api/v1/users/statistics:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics about users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route("/statistics")
  .get(
    authMiddleware,
    roleMiddleware("admin"),
    asyncHandler(getUserStatistics),
  );

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by name, email, role or status (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [viewer, analyst, admin]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route("/search")
  .get(authMiddleware, roleMiddleware("admin"), asyncHandler(searchUsers));

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the logged-in user's profile
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.route("/profile").get(authMiddleware, asyncHandler(getUserProfile));

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: Update own profile
 *     description: Update current user's profile (name, email, password)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router
  .route("/profile")
  .patch(
    authMiddleware,
    validateInput(updateUserProfileDto),
    asyncHandler(updateOwnProfile),
  );

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden
 */
router
  .route("/:id")
  .get(authMiddleware, roleMiddleware("admin"), asyncHandler(getUserById));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user role and status
 *     description: Admin update user role and status
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [viewer, analyst, admin]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router
  .route("/:id")
  .put(
    authMiddleware,
    roleMiddleware("admin"),
    validateInput(updateUserAdminDto),
    asyncHandler(updateUserRoleAndStatus),
  );

/**
 * @swagger
 * /api/v1/users/{id}/restore:
 *   patch:
 *     summary: Restore soft deleted user
 *     description: Restore a soft-deleted (deactivated) user account
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored successfully
 *       404:
 *         description: User not found
 */
router
  .route("/:id/restore")
  .patch(authMiddleware, roleMiddleware("admin"), asyncHandler(restoreUser));

/**
 * @swagger
 * /api/v1/users/secure-delete:
 *   delete:
 *     summary: Delete user account with password
 *     description: Permanently delete user account with password verification
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized or wrong password
 */
router
  .route("/secure-delete")
  .delete(
    authMiddleware,
    validateInput(deleteUserWithPasswordDto),
    asyncHandler(deleteUserWithPassword),
  );

/**
 * @swagger
 * /api/v1/users/bulk-delete:
 *   delete:
 *     summary: Bulk delete users
 *     description: Delete multiple users at once (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userIds]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [id1, id2, id3]
 *     responses:
 *       200:
 *         description: Users deleted successfully
 */
router
  .route("/bulk-delete")
  .delete(
    authMiddleware,
    roleMiddleware("admin"),
    validateInput(bulkDeleteUserDto),
    asyncHandler(bulkDeleteUsers),
  );

export default router;
