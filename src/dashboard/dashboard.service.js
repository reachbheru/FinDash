import Transaction from "../transaction/schema/transaction.schema.js";
import { AppError } from "../middlewares/errorHandler.js";
import { ObjectId } from "mongodb";

class DashboardService {
  // ============= GET DASHBOARD OVERVIEW =============
  async getDashboardOverview(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { startDate, endDate } = req.query;

    const query = { userId: userIdObject, isDeleted: false };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Overall statistics
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $facet: {
          income: [
            { $match: { type: "income" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],
          expense: [
            { $match: { type: "expense" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                type: { $first: "$type" },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 10 },
          ],
          topExpenseCategories: [
            { $match: { type: "expense" } },
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const [result] = stats;
    const totalIncome = result.income[0]?.total || 0;
    const incomeCount = result.income[0]?.count || 0;
    const totalExpense = result.expense[0]?.total || 0;
    const expenseCount = result.expense[0]?.count || 0;
    const balance = totalIncome - totalExpense;

    return {
      success: true,
      message: "Dashboard overview retrieved successfully",
      data: {
        overview: {
          totalIncome,
          totalExpense,
          balance,
          incomeCount,
          expenseCount,
          totalTransactions: incomeCount + expenseCount,
        },
        topCategories: result.byCategory,
        topExpenseCategories: result.topExpenseCategories,
      },
      statusCode: 200,
    };
  }

  // ============= GET MONTHLY TRENDS =============
  async getMonthlyTrends(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { months = 12, startDate: startDateParam } = req.query;

    let startDate = new Date();

    if (startDateParam) {
      // If startDate is provided, use it as the base
      startDate = new Date(startDateParam);
    } else {
      // Use default implementation - go back (months - 1) months from current month
      startDate.setMonth(startDate.getMonth() - (months - 1));
    }

    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const query = {
      userId: userIdObject,
      isDeleted: false,
      date: { $gte: startDate },
    };

    const monthlyTrends = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
          transactionCount: { $sum: "$count" },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$income", "$expense"] },
          monthName: {
            $let: {
              vars: {
                months: [
                  null,
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$months", "$_id.month"],
              },
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return {
      success: true,
      message: "Monthly trends retrieved successfully",
      data: {
        trends: monthlyTrends,
        totalPeriods: monthlyTrends.length,
      },
      statusCode: 200,
    };
  }

  // ============= GET WEEKLY TRENDS =============
  async getWeeklyTrends(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { weeks = 12 } = req.query;

    // Get the start of this week (Sunday)
    const today = new Date();
    const currentWeekStart = new Date(today);
    const day = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - day);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Go back (weeks - 1) weeks from the start of this week to get exactly 'weeks' weeks
    const startDate = new Date(currentWeekStart);
    startDate.setDate(startDate.getDate() - (weeks - 1) * 7);

    const query = {
      userId: userIdObject,
      isDeleted: false,
      date: { $gte: startDate },
    };

    const weeklyTrends = await Transaction.aggregate([
      { $match: query },
      {
        $addFields: {
          weekStart: {
            $dateFromString: {
              dateString: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $subtract: [
                      "$date",
                      {
                        $multiply: [
                          { $subtract: [{ $dayOfWeek: "$date" }, 1] },
                          86400000,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            weekStart: "$weekStart",
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.weekStart",
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
          transactionCount: { $sum: "$count" },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$income", "$expense"] },
          weekLabel: {
            $dateToString: { format: "%Y-%m-%d", date: "$_id" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      success: true,
      message: "Weekly trends retrieved successfully",
      data: {
        trends: weeklyTrends,
        totalWeeks: weeklyTrends.length,
      },
      statusCode: 200,
    };
  }

  // ============= GET RECENT TRANSACTIONS =============
  async getRecentTransactions(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { limit = 10 } = req.query;

    const recentTransactions = await Transaction.find({
      userId: userIdObject,
      isDeleted: false,
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .select("-__v");

    return {
      success: true,
      message: "Recent transactions retrieved successfully",
      data: recentTransactions,
      statusCode: 200,
    };
  }

  // ============= GET CATEGORY BREAKDOWN =============
  async getCategoryBreakdown(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { type, startDate, endDate } = req.query;

    const query = { userId: userIdObject, isDeleted: false };

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const categoryBreakdown = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
          type: { $first: "$type" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $facet: {
          byAmount: [{ $sort: { total: -1 } }],
          byCount: [{ $sort: { count: -1 } }],
        },
      },
    ]);

    // Calculate total for percentage
    const allTransactions = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const grandTotal = allTransactions[0]?.total || 0;

    // Add percentages
    const withPercentages = categoryBreakdown[0].byAmount.map((cat) => ({
      ...cat,
      percentage:
        grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(2) : 0,
    }));

    return {
      success: true,
      message: "Category breakdown retrieved successfully",
      data: {
        categories: withPercentages,
        grandTotal,
        totalCategories: withPercentages.length,
      },
      statusCode: 200,
    };
  }

  // ============= GET SPENDING PATTERNS =============
  async getSpendingPatterns(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { startDate, endDate } = req.query;

    const query = {
      userId: userIdObject,
      isDeleted: false,
      type: "expense",
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const patterns = await Transaction.aggregate([
      { $match: query },
      {
        $facet: {
          byDayOfWeek: [
            {
              $group: {
                _id: {
                  dayOfWeek: { $dayOfWeek: "$date" },
                },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.dayOfWeek": 1 } },
            {
              $addFields: {
                dayName: {
                  $let: {
                    vars: {
                      days: [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ],
                    },
                    in: {
                      $arrayElemAt: [
                        "$$days",
                        { $subtract: ["$_id.dayOfWeek", 1] },
                      ],
                    },
                  },
                },
              },
            },
          ],
          categoryDistribution: [
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 5 },
          ],
          topSpendingDates: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$date" },
                },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    // Calculate average daily spending
    const allDays = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const uniqueDays = allDays.length;
    const totalSpent = allDays.reduce((sum, day) => sum + day.total, 0);
    const averageDailySpending =
      uniqueDays > 0 ? (totalSpent / uniqueDays).toFixed(2) : 0;

    const [result] = patterns;

    return {
      success: true,
      message: "Spending patterns retrieved successfully",
      data: {
        byDayOfWeek: result.byDayOfWeek,
        topExpenseCategories: result.categoryDistribution,
        topSpendingDates: result.topSpendingDates,
        statistics: {
          averageDailySpending: parseFloat(averageDailySpending),
          totalDaysWithSpending: uniqueDays,
          totalSpent,
        },
      },
      statusCode: 200,
    };
  }

  // ============= GET INCOME vs EXPENSE COMPARISON =============
  async getIncomeExpenseComparison(req) {
    const userId = req.user.userId;
    const { startDate, endDate, period = "month" } = req.query;

    const userIdObject = new ObjectId(userId);
    const query = { userId: userIdObject, isDeleted: false };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let groupStage;
    if (period === "week") {
      groupStage = {
        _id: {
          year: { $year: "$date" },
          week: { $week: "$date" },
        },
      };
    } else {
      groupStage = {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
      };
    }

    const comparison = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          ...groupStage,
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          incomeTransactions: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, 1, 0],
            },
          },
          expenseTransactions: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$income", "$expense"] },
          savingsRate: {
            $cond: [
              { $eq: ["$income", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$income", "$expense"] },
                      "$income",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    return {
      success: true,
      message: "Income vs expense comparison retrieved successfully",
      data: {
        comparison,
        period,
      },
      statusCode: 200,
    };
  }
}

export default new DashboardService();
