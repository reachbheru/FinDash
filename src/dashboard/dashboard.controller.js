import dashboardService from "./dashboard.service.js";

// ============= GET DASHBOARD OVERVIEW =============
export const getDashboardOverview = async (req, res, next) => {
  const response = await dashboardService.getDashboardOverview(req);
  res.status(response.statusCode).json(response);
};

// ============= GET MONTHLY TRENDS =============
export const getMonthlyTrends = async (req, res, next) => {
  const response = await dashboardService.getMonthlyTrends(req);
  res.status(response.statusCode).json(response);
};

// ============= GET WEEKLY TRENDS =============
export const getWeeklyTrends = async (req, res, next) => {
  const response = await dashboardService.getWeeklyTrends(req);
  res.status(response.statusCode).json(response);
};

// ============= GET RECENT TRANSACTIONS =============
export const getRecentTransactions = async (req, res, next) => {
  const response = await dashboardService.getRecentTransactions(req);
  res.status(response.statusCode).json(response);
};

// ============= GET CATEGORY BREAKDOWN =============
export const getCategoryBreakdown = async (req, res, next) => {
  const response = await dashboardService.getCategoryBreakdown(req);
  res.status(response.statusCode).json(response);
};

// ============= GET SPENDING PATTERNS =============
export const getSpendingPatterns = async (req, res, next) => {
  const response = await dashboardService.getSpendingPatterns(req);
  res.status(response.statusCode).json(response);
};

// ============= GET INCOME VS EXPENSE COMPARISON =============
export const getIncomeExpenseComparison = async (req, res, next) => {
  const response = await dashboardService.getIncomeExpenseComparison(req);
  res.status(response.statusCode).json(response);
};
