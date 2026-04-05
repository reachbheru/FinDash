import transactionService from "./transaction.service.js";

// ============= CREATE TRANSACTION =============
export const createTransaction = async (req, res, next) => {
  const userId = req.user.userId;
  const response = await transactionService.createTransaction(
    userId,
    req.validatedBody,
  );
  res.status(response.statusCode).json(response);
};

// ============= GET ALL TRANSACTIONS =============
export const getAllTransactions = async (req, res, next) => {
  const response = await transactionService.getAllTransactions(req);
  res.status(response.statusCode).json(response);
};

// ============= GET SINGLE TRANSACTION =============
export const getTransactionById = async (req, res, next) => {
  const response = await transactionService.getTransactionById(req);
  res.status(response.statusCode).json(response);
};

// ============= GET TRANSACTIONS BY FILTER =============
export const getTransactionsByFilter = async (req, res, next) => {
  const response = await transactionService.getTransactionsByFilter(req);
  res.status(response.statusCode).json(response);
};

// ============= GET TRANSACTION SUMMARY =============
export const getTransactionSummary = async (req, res, next) => {
  const response = await transactionService.getTransactionSummary(req);
  res.status(response.statusCode).json(response);
};

// ============= UPDATE TRANSACTION =============
export const updateTransaction = async (req, res, next) => {
  const response = await transactionService.updateTransaction(req);
  res.status(response.statusCode).json(response);
};

// ============= DELETE TRANSACTION =============
export const deleteTransaction = async (req, res, next) => {
  const response = await transactionService.deleteTransaction(req);
  res.status(response.statusCode).json(response);
};

// ============= RESTORE TRANSACTION =============
export const restoreTransaction = async (req, res, next) => {
  const response = await transactionService.restoreTransaction(req);
  res.status(response.statusCode).json(response);
};

// ============= BULK DELETE TRANSACTIONS =============
export const bulkDeleteTransactions = async (req, res, next) => {
  const response = await transactionService.bulkDeleteTransactions(req);
  res.status(response.statusCode).json(response);
};
