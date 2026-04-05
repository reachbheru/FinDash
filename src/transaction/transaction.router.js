import { Router } from "express";
import { validateInput } from "../middlewares/inputValidator.js";
import {
  createTransactionDto,
  updateTransactionDto,
  bulkDeleteTransactionsDto,
} from "./dto/index.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByFilter,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  bulkDeleteTransactions,
} from "./transaction.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/transactions/summary:
 *   get:
 *     summary: Get transaction summary
 *     description: Get overall transaction statistics with breakdown by category and type
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router
  .route("/summary")
  .get(authMiddleware, asyncHandler(getTransactionSummary));

/**
 * @swagger
 * /api/v1/transactions/filter:
 *   get:
 *     summary: Filter transactions
 *     description: Get transactions filtered by type, category, date with pagination
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Filtered transactions retrieved
 */
router
  .route("/filter")
  .get(authMiddleware, asyncHandler(getTransactionsByFilter));

/**
 * @swagger
 * /api/v1/transactions/bulk-delete:
 *   post:
 *     summary: Bulk delete transactions
 *     description: Soft delete multiple transactions at once (Admin only)
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [transactionIds]
 *             properties:
 *               transactionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [id1, id2, id3]
 *     responses:
 *       200:
 *         description: Transactions deleted successfully
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route("/bulk-delete")
  .post(
    authMiddleware,
    roleMiddleware("admin"),
    validateInput(bulkDeleteTransactionsDto),
    asyncHandler(bulkDeleteTransactions),
  );

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create transaction
 *     description: Create a new transaction (Admin only)
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, description, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500.50
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: food
 *               description:
 *                 type: string
 *                 example: Grocery shopping
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route("/")
  .post(
    authMiddleware,
    roleMiddleware("admin"),
    validateInput(createTransactionDto),
    asyncHandler(createTransaction),
  );

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Get all transactions with pagination, filtering, and summary
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: "-date"
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                 summary:
 *                   type: object
 */
router.route("/").get(authMiddleware, asyncHandler(getAllTransactions));

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction
 *     tags:
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 */
router.route("/:id").get(authMiddleware, asyncHandler(getTransactionById));

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   patch:
 *     summary: Update transaction
 *     description: Update a transaction (Admin only)
 *     tags:
 *       - Transactions
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
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
router
  .route("/:id")
  .patch(
    authMiddleware,
    roleMiddleware("admin"),
    validateInput(updateTransactionDto),
    asyncHandler(updateTransaction),
  );

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     description: Soft delete a transaction (Admin only)
 *     tags:
 *       - Transactions
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
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
router
  .route("/:id")
  .delete(
    authMiddleware,
    roleMiddleware("admin"),
    asyncHandler(deleteTransaction),
  );

/**
 * @swagger
 * /api/v1/transactions/{id}/restore:
 *   patch:
 *     summary: Restore transaction
 *     description: Restore a soft-deleted transaction (Admin only)
 *     tags:
 *       - Transactions
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
 *         description: Transaction restored successfully
 *       404:
 *         description: Transaction not found
 */
router
  .route("/:id/restore")
  .patch(
    authMiddleware,
    roleMiddleware("admin"),
    asyncHandler(restoreTransaction),
  );

export default router;
