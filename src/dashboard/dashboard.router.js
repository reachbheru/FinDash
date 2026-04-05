import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  getDashboardOverview,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentTransactions,
  getCategoryBreakdown,
  getSpendingPatterns,
  getIncomeExpenseComparison,
} from "./dashboard.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     description: Get overall dashboard summary with income, expense, balance, and top categories
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst/Admin access required
 */
router
  .route("/")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getDashboardOverview),
  );

/**
 * @swagger
 * /api/v1/dashboard/trends/monthly:
 *   get:
 *     summary: Get monthly trends
 *     description: Get monthly income vs expense trends with balance calculations
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to retrieve
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom start date
 *     responses:
 *       200:
 *         description: Monthly trends retrieved successfully
 */
router
  .route("/trends/monthly")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getMonthlyTrends),
  );

/**
 * @swagger
 * /api/v1/dashboard/trends/weekly:
 *   get:
 *     summary: Get weekly trends
 *     description: Get weekly income vs expense trends with exact week count
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of weeks to retrieve
 *     responses:
 *       200:
 *         description: Weekly trends retrieved successfully
 */
router
  .route("/trends/weekly")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getWeeklyTrends),
  );

/**
 * @swagger
 * /api/v1/dashboard/recent:
 *   get:
 *     summary: Get recent transactions
 *     description: Retrieve recent transactions for quick overview
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent transactions
 *     responses:
 *       200:
 *         description: Recent transactions retrieved successfully
 */
router
  .route("/recent")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getRecentTransactions),
  );

/**
 * @swagger
 * /api/v1/dashboard/categories:
 *   get:
 *     summary: Get category breakdown
 *     description: Get category-wise breakdown with percentages and averages
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
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
 *     responses:
 *       200:
 *         description: Category breakdown retrieved successfully
 */
router
  .route("/categories")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getCategoryBreakdown),
  );

/**
 * @swagger
 * /api/v1/dashboard/patterns:
 *   get:
 *     summary: Get spending patterns
 *     description: Get spending patterns by day of week, top categories, and top spending dates
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Spending patterns retrieved successfully
 */
router
  .route("/patterns")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getSpendingPatterns),
  );

/**
 * @swagger
 * /api/v1/dashboard/comparison:
 *   get:
 *     summary: Get income vs expense comparison
 *     description: Get income vs expense comparison with savings rate calculations
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month]
 *           default: month
 *         description: Comparison period
 *     responses:
 *       200:
 *         description: Income vs expense comparison retrieved successfully
 */
router
  .route("/comparison")
  .get(
    authMiddleware,
    roleMiddleware("analyst", "admin"),
    asyncHandler(getIncomeExpenseComparison),
  );

export default router;
