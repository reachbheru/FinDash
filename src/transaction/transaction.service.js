import Transaction from "./schema/transaction.schema.js";
import { AppError } from "../middlewares/errorHandler.js";
import { ObjectId } from "mongodb";

class TransactionService {
  // ============= CREATE TRANSACTION =============
  async createTransaction(userId, transactionData) {
    const newTransaction = new Transaction({
      userId,
      ...transactionData,
    });

    await newTransaction.save();

    return {
      success: true,
      message: "Transaction created successfully",
      data: newTransaction,
      statusCode: 201,
    };
  }

  // ============= GET ALL TRANSACTIONS =============
  async getAllTransactions(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      sortBy = "-date",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { userId: userIdObject, isDeleted: false };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortBy);

    const total = await Transaction.countDocuments(query);

    // Calculate summary
    const incomeRes = await Transaction.aggregate([
      {
        $match: { ...query, type: "income" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const expenseRes = await Transaction.aggregate([
      {
        $match: { ...query, type: "expense" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalIncome = incomeRes.length > 0 ? incomeRes[0].total : 0;
    const totalExpense = expenseRes.length > 0 ? expenseRes[0].total : 0;
    const balance = totalIncome - totalExpense;

    return {
      success: true,
      message: "Transactions retrieved successfully",
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalIncome,
        totalExpense,
        balance,
      },
      statusCode: 200,
    };
  }

  // ============= GET SINGLE TRANSACTION =============
  async getTransactionById(req) {
    const userId = req.user.userId;
    const { id } = req.params;

    const transaction = await Transaction.findById(id);

    if (
      !transaction ||
      transaction.isDeleted ||
      transaction.userId.toString() !== userId
    ) {
      throw new AppError("Transaction not found", 404);
    }

    return {
      success: true,
      message: "Transaction retrieved successfully",
      data: transaction,
      statusCode: 200,
    };
  }

  // ============= GET TRANSACTIONS BY FILTER =============
  async getTransactionsByFilter(req) {
    const userId = req.user.userId;
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { userId, isDeleted: false };

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Transaction.countDocuments(query);

    return {
      success: true,
      message: "Filtered transactions retrieved successfully",
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      statusCode: 200,
    };
  }

  // ============= GET TRANSACTION SUMMARY =============
  async getTransactionSummary(req) {
    const userId = req.user.userId;
    const userIdObject = new ObjectId(userId);
    const { startDate, endDate } = req.query;

    console.log("Generating transaction summary for user:", userId);
    console.log("Date range:", startDate, "to", endDate);

    const query = { userId: userIdObject, isDeleted: false };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Overall summary
    const incomeRes = await Transaction.aggregate([
      { $match: { ...query, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const expenseRes = await Transaction.aggregate([
      { $match: { ...query, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // By category
    const byCategory = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          type: { $first: "$type" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // By type
    const byType = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalIncome = incomeRes.length > 0 ? incomeRes[0].total : 0;
    const totalExpense = expenseRes.length > 0 ? expenseRes[0].total : 0;

    return {
      success: true,
      message: "Transaction summary retrieved successfully",
      data: {
        overall: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        },
        byCategory,
        byType,
      },
      statusCode: 200,
    };
  }

  // ============= UPDATE TRANSACTION =============
  async updateTransaction(req) {
    const userId = req.user.userId;
    const { id } = req.params;
    const updateData = req.validatedBody;

    const transaction = await Transaction.findById(id);

    if (
      !transaction ||
      transaction.isDeleted ||
      transaction.userId.toString() !== userId
    ) {
      throw new AppError("Transaction not found", 404);
    }

    Object.assign(transaction, updateData);
    await transaction.save();

    return {
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
      statusCode: 200,
    };
  }

  // ============= SOFT DELETE TRANSACTION =============
  async deleteTransaction(req) {
    const userId = req.user.userId;
    const { id } = req.params;

    const transaction = await Transaction.findById(id);

    if (
      !transaction ||
      transaction.isDeleted ||
      transaction.userId.toString() !== userId
    ) {
      throw new AppError("Transaction not found", 404);
    }

    transaction.isDeleted = true;
    transaction.deletedAt = new Date();
    await transaction.save();

    return {
      success: true,
      message: "Transaction deleted successfully",
      data: null,
      statusCode: 200,
    };
  }

  // ============= RESTORE DELETED TRANSACTION =============
  async restoreTransaction(req) {
    const userId = req.user.userId;
    const { id } = req.params;

    const transaction = await Transaction.findById(id);

    if (
      !transaction ||
      !transaction.isDeleted ||
      transaction.userId.toString() !== userId
    ) {
      throw new AppError("Transaction not found or not deleted", 404);
    }

    transaction.isDeleted = false;
    transaction.deletedAt = null;
    await transaction.save();

    return {
      success: true,
      message: "Transaction restored successfully",
      data: transaction,
      statusCode: 200,
    };
  }

  // ============= BULK DELETE TRANSACTIONS =============
  async bulkDeleteTransactions(req) {
    const userId = req.user.userId;
    const { transactionIds } = req.validatedBody;

    const result = await Transaction.updateMany(
      {
        _id: { $in: transactionIds },
        userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
    );

    if (result.matchedCount === 0) {
      throw new AppError("No transactions found to delete", 404);
    }

    return {
      success: true,
      message: `${result.modifiedCount} transaction(s) deleted successfully`,
      data: {
        deletedCount: result.modifiedCount,
      },
      statusCode: 200,
    };
  }
}

export default new TransactionService();
